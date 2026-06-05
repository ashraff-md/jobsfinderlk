import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole, VerificationTokenType } from '@prisma/client';
import { createHash, randomBytes, randomInt } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

const EMAIL_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const PHONE_OTP_TTL_MS = 10 * 60 * 1000;
const PHONE_OTP_RESEND_MS = 60 * 1000;

function hashCode(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.startsWith('94') && digits.length === 11) {
    return `+${digits}`;
  }
  if (digits.startsWith('0') && digits.length === 10) {
    return `+94${digits.slice(1)}`;
  }
  if (digits.length === 9) {
    return `+94${digits}`;
  }
  return value.trim();
}

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async getRecruiterVerificationStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        emailVerified: true,
        employerUsers: {
          orderBy: { createdAt: 'asc' },
          take: 1,
          select: {
            fullName: true,
            title: true,
            contactNo: true,
            phoneVerified: true,
          },
        },
      },
    });
    if (!user) throw new ForbiddenException();

    const employer = user.employerUsers[0];
    const missingProfileFields = this.getMissingProfileFields(employer);
    const profileComplete = missingProfileFields.length === 0;

    return {
      profileComplete,
      missingProfileFields,
      email: user.email,
      emailVerified: user.emailVerified,
      contactNo: employer?.contactNo ?? null,
      phoneVerified: employer?.phoneVerified ?? false,
      canPostJobs:
        profileComplete &&
        user.emailVerified &&
        (employer?.phoneVerified ?? false),
    };
  }

  private getMissingProfileFields(
    employer?: {
      fullName: string | null;
      title: string | null;
      contactNo: string | null;
    } | null,
  ) {
    const missing: Array<'fullName' | 'title' | 'contactNo' | 'company'> = [];
    if (!employer) {
      missing.push('company');
      return missing;
    }
    if (!employer.fullName?.trim()) missing.push('fullName');
    if (!employer.title?.trim()) missing.push('title');
    if (!employer.contactNo?.trim()) missing.push('contactNo');
    return missing;
  }

  async assertRecruiterCanPostJobs(userId: string) {
    const status = await this.getRecruiterVerificationStatus(userId);
    if (status.profileComplete && status.canPostJobs) return;

    if (!status.profileComplete) {
      throw new ForbiddenException(
        'Complete your recruiter profile before posting a vacancy.',
      );
    }

    const missing: string[] = [];
    if (!status.emailVerified) missing.push('email');
    if (!status.phoneVerified) missing.push('phone');

    throw new ForbiddenException(
      `Verify your ${missing.join(' and ')} before posting a vacancy.`,
    );
  }

  async sendEmailVerification(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ForbiddenException();
    if (user.role !== UserRole.EMPLOYER) {
      throw new ForbiddenException('Email verification is only required for recruiters');
    }
    if (user.emailVerified) {
      return { message: 'Email is already verified', alreadyVerified: true };
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + EMAIL_TOKEN_TTL_MS);

    await this.prisma.verificationToken.deleteMany({
      where: { userId, type: VerificationTokenType.EMAIL },
    });
    await this.prisma.verificationToken.create({
      data: {
        userId,
        type: VerificationTokenType.EMAIL,
        target: user.email,
        codeHash: hashCode(token),
        expiresAt,
      },
    });

    const frontendUrl = this.config.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    const verifyUrl = `${frontendUrl}/auth/verify-email?token=${token}`;

    await this.dispatchEmail(user.email, verifyUrl);

    return {
      message: 'Verification email sent',
      alreadyVerified: false,
    };
  }

  async verifyEmailToken(token: string) {
    const trimmed = token?.trim();
    if (!trimmed) {
      throw new BadRequestException('Verification token is required');
    }

    const record = await this.prisma.verificationToken.findFirst({
      where: {
        type: VerificationTokenType.EMAIL,
        codeHash: hashCode(trimmed),
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });
    if (!record) {
      throw new BadRequestException('Invalid or expired verification link');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { emailVerified: true },
      }),
      this.prisma.verificationToken.deleteMany({
        where: { userId: record.userId, type: VerificationTokenType.EMAIL },
      }),
    ]);

    return {
      message: 'Email verified successfully',
      email: record.user.email,
    };
  }

  async sendPhoneOtp(userId: string, contactNo: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        employerUsers: { orderBy: { createdAt: 'asc' }, take: 1 },
      },
    });
    if (!user) throw new ForbiddenException();
    if (user.role !== UserRole.EMPLOYER) {
      throw new ForbiddenException('Phone verification is only required for recruiters');
    }

    const link = user.employerUsers[0];
    if (!link) {
      throw new ForbiddenException(
        'Link a company to your account before verifying your phone number.',
      );
    }

    const normalized = normalizePhone(contactNo);
    if (normalized.replace(/\D/g, '').length < 9) {
      throw new BadRequestException('Enter a valid phone number');
    }

    if (link.phoneVerified && link.contactNo === normalized) {
      return { message: 'Phone number is already verified', alreadyVerified: true };
    }

    const recent = await this.prisma.verificationToken.findFirst({
      where: {
        userId,
        type: VerificationTokenType.PHONE,
        target: normalized,
        createdAt: { gt: new Date(Date.now() - PHONE_OTP_RESEND_MS) },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (recent) {
      throw new BadRequestException('Please wait a minute before requesting another OTP');
    }

    const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
    const expiresAt = new Date(Date.now() + PHONE_OTP_TTL_MS);

    await this.prisma.$transaction([
      this.prisma.verificationToken.deleteMany({
        where: { userId, type: VerificationTokenType.PHONE },
      }),
      this.prisma.verificationToken.create({
        data: {
          userId,
          type: VerificationTokenType.PHONE,
          target: normalized,
          codeHash: hashCode(code),
          expiresAt,
        },
      }),
      this.prisma.employerUser.update({
        where: { id: link.id },
        data: {
          contactNo: normalized,
          phoneVerified: false,
          phoneVerifiedAt: null,
        },
      }),
    ]);

    await this.dispatchSms(normalized, code);

    return {
      message: 'OTP sent to your phone',
      contactNo: normalized,
      alreadyVerified: false,
    };
  }

  async confirmPhoneOtp(userId: string, code: string) {
    const trimmed = code.trim();
    const record = await this.prisma.verificationToken.findFirst({
      where: {
        userId,
        type: VerificationTokenType.PHONE,
        codeHash: hashCode(trimmed),
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (!record) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const link = await this.prisma.employerUser.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    if (!link) {
      throw new ForbiddenException('No company is linked to your account');
    }

    await this.prisma.$transaction([
      this.prisma.employerUser.update({
        where: { id: link.id },
        data: {
          contactNo: record.target,
          phoneVerified: true,
          phoneVerifiedAt: new Date(),
        },
      }),
      this.prisma.verificationToken.deleteMany({
        where: { userId, type: VerificationTokenType.PHONE },
      }),
    ]);

    return {
      message: 'Phone number verified successfully',
      contactNo: record.target,
    };
  }

  resetPhoneVerificationIfContactChanged(
    previousContact: string | null | undefined,
    nextContact: string | null | undefined,
  ) {
    const prev = previousContact?.trim() || null;
    const next = nextContact?.trim() || null;
    if (prev === next) return {};
    return { phoneVerified: false, phoneVerifiedAt: null };
  }

  private async dispatchEmail(email: string, verifyUrl: string) {
    const apiKey = this.config.get<string>('SENDGRID_API_KEY');
    if (!apiKey) {
      this.logger.log(`[dev] Email verification link for ${email}: ${verifyUrl}`);
      return;
    }

    const from = this.config.get<string>(
      'EMAIL_FROM',
      'noreply@jobsfinder.lk',
    );
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email }] }],
        from: { email: from, name: 'JobsFinder.lk' },
        subject: 'Verify your email address',
        content: [
          {
            type: 'text/plain',
            value: `Verify your JobsFinder.lk email address by opening this link:\n\n${verifyUrl}\n\nThis link expires in 24 hours.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      this.logger.error(`SendGrid error: ${response.status} ${await response.text()}`);
      throw new BadRequestException('Could not send verification email. Try again later.');
    }
  }

  private async dispatchSms(phone: string, code: string) {
    const accountSid = this.config.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.config.get<string>('TWILIO_AUTH_TOKEN');
    const from = this.config.get<string>('TWILIO_PHONE_NUMBER');

    if (!accountSid || !authToken || !from) {
      this.logger.log(`[dev] Phone OTP for ${phone}: ${code}`);
      return;
    }

    const body = new URLSearchParams({
      To: phone,
      From: from,
      Body: `Your JobsFinder.lk verification code is ${code}. It expires in 10 minutes.`,
    });

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      },
    );

    if (!response.ok) {
      this.logger.error(`Twilio error: ${response.status} ${await response.text()}`);
      throw new BadRequestException('Could not send OTP. Try again later.');
    }
  }
}
