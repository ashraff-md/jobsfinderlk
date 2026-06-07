import { PrismaClient, UserRole, JobStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { JOB_CATEGORY_NAMES } from '../src/modules/jobs/job-categories.constants';
import { slugify } from '../src/common/utils/slug.util';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@jobsfinder.lk' },
    update: {},
    create: {
      email: 'admin@jobsfinder.lk',
      passwordHash,
      role: UserRole.ADMIN,
      emailVerified: true,
      adminProfile: {
        create: {
          firstName: 'Platform',
          lastName: 'Admin',
          email: 'admin@jobsfinder.lk',
          contactNo: '+94 11 000 0000',
        },
      },
    },
  });

  await prisma.adminProfile.upsert({
    where: { userId: admin.id },
    update: {
      firstName: 'Platform',
      lastName: 'Admin',
      email: 'admin@jobsfinder.lk',
    },
    create: {
      userId: admin.id,
      firstName: 'Platform',
      lastName: 'Admin',
      email: 'admin@jobsfinder.lk',
      contactNo: '+94 11 000 0000',
    },
  });

  const seeker = await prisma.user.upsert({
    where: { email: 'seeker@jobsfinder.lk' },
    update: {},
    create: {
      email: 'seeker@jobsfinder.lk',
      passwordHash,
      role: UserRole.SEEKER,
      emailVerified: true,
      seekerProfile: {
        create: {
          fullName: 'Alex Silva',
          headline: 'Senior Product Designer',
        },
      },
    },
  });

  const employer = await prisma.user.upsert({
    where: { email: 'hr@wso2.com' },
    update: {},
    create: {
      email: 'hr@wso2.com',
      passwordHash,
      role: UserRole.EMPLOYER,
      emailVerified: true,
    },
  });

  const wso2 = await prisma.company.upsert({
    where: { slug: 'wso2' },
    update: {},
    create: {
      name: 'WSO2',
      slug: 'wso2',
      website: 'https://wso2.com',
      description: 'Leading integration and API management company.',
      verified: true,
    },
  });

  await prisma.company.upsert({
    where: { slug: 'dialog-axiata' },
    update: {},
    create: {
      name: 'Dialog Axiata',
      slug: 'dialog-axiata',
      website: 'https://dialog.lk',
      description: 'Sri Lanka\'s premier connectivity provider.',
      verified: true,
    },
  });

  await prisma.employerUser.upsert({
    where: { userId_companyId: { userId: employer.id, companyId: wso2.id } },
    update: {
      fullName: 'WSO2 HR Manager',
      title: 'HR Manager',
      contactNo: '+94771234567',
      phoneVerified: true,
      phoneVerifiedAt: new Date(),
    },
    create: {
      userId: employer.id,
      companyId: wso2.id,
      fullName: 'WSO2 HR Manager',
      title: 'HR Manager',
      contactNo: '+94771234567',
      phoneVerified: true,
      phoneVerifiedAt: new Date(),
    },
  });

  const jobs = [
    {
      title: 'Senior Product Designer',
      slug: 'senior-product-designer',
      description:
        'Lead product design for enterprise integration platforms. 5+ years experience with design systems and user research.',
      location: 'Colombo (Hybrid)',
      salaryMin: 350000,
      salaryMax: 550000,
      employmentType: 'Full-time',
      experienceLevel: 'Mid-Senior',
      industry: 'Technology',
      companyId: wso2.id,
    },
    {
      title: 'Senior Front-end Architect',
      slug: 'senior-front-end-architect',
      description:
        'Architect scalable React applications. Experience with TypeScript, micro-frontends, and team leadership required.',
      location: 'Colombo, LK (Remote)',
      salaryMin: 350000,
      salaryMax: 550000,
      employmentType: 'Full-time',
      experienceLevel: 'Senior',
      industry: 'Technology',
      companyId: wso2.id,
    },
    {
      title: 'Full Stack Engineer',
      slug: 'full-stack-engineer',
      description:
        'Build modern web applications with Node.js and React. Strong PostgreSQL and API design skills.',
      location: 'Colombo',
      salaryMin: 250000,
      salaryMax: 400000,
      employmentType: 'Full-time',
      experienceLevel: 'Mid-Senior',
      industry: 'Technology',
      companyId: wso2.id,
    },
  ];

  for (const job of jobs) {
    await prisma.job.upsert({
      where: { slug: job.slug },
      update: { status: JobStatus.PUBLISHED, publishedAt: new Date() },
      create: {
        ...job,
        status: JobStatus.PUBLISHED,
        publishedAt: new Date(),
        isFeatured: job.slug === 'senior-product-designer',
      },
    });
  }

  for (const [index, name] of JOB_CATEGORY_NAMES.entries()) {
    const slug = slugify(name);
    await prisma.jobCategory.upsert({
      where: { name },
      update: { slug, sortOrder: index + 1, active: true, icon: 'work' },
      create: { name, slug, sortOrder: index + 1, active: true, icon: 'work' },
    });
  }

  console.log('Seed complete:', {
    admin: admin.email,
    seeker: seeker.email,
    employer: employer.email,
    password: 'Password123!',
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
