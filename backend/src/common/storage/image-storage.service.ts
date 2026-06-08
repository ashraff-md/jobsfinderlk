import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, writeFile } from 'fs/promises';
import { join, posix } from 'path';
import { randomUUID } from 'crypto';
import {
  BANNER_IMAGE_LIMITS,
  DEFAULT_IMAGE_LIMITS,
  IMAGE_UPLOAD_FOLDERS,
  MAX_LIFE_AT_IMAGES,
  type ImageDataLimits,
  type ImageUploadFolder,
} from './image-storage.constants';
import { isImageDataUrl, parseImageDataUrl } from './image-data.util';
import {
  isVacancyArtworkDataUrl,
  parseVacancyArtworkDataUrl,
  VACANCY_ARTWORK_LIMITS,
} from './vacancy-artwork.util';

@Injectable()
export class ImageStorageService implements OnModuleInit {
  private readonly uploadRoot: string;
  private readonly publicPath: string;
  private readonly publicBaseUrl: string;

  constructor(private readonly config: ConfigService) {
    const configuredRoot = this.config.get<string>('UPLOAD_ROOT', './images');
    this.uploadRoot = configuredRoot.startsWith('/')
      ? configuredRoot
      : join(process.cwd(), configuredRoot);

    this.publicPath = this.normalizePublicPath(
      this.config.get<string>('UPLOAD_PUBLIC_PATH', '/uploads'),
    );

    const port = this.config.get<string>('PORT', '4000');
    this.publicBaseUrl = (
      this.config.get<string>('UPLOAD_PUBLIC_BASE_URL') ??
      `http://localhost:${port}`
    ).replace(/\/$/, '');
  }

  async onModuleInit() {
    await Promise.all(
      Object.values(IMAGE_UPLOAD_FOLDERS).map((folder) =>
        mkdir(join(this.uploadRoot, folder), { recursive: true }),
      ),
    );
  }

  getUploadRoot(): string {
    return this.uploadRoot;
  }

  getPublicPath(): string {
    return this.publicPath;
  }

  /** Persist a data URL; returns a relative path stored in the database. */
  async saveDataUrl(
    folder: ImageUploadFolder,
    input?: string | null,
    limits: ImageDataLimits = DEFAULT_IMAGE_LIMITS,
  ): Promise<string | null> {
    if (!input?.trim()) return null;

    const trimmed = input.trim();
    if (!isImageDataUrl(trimmed, limits)) {
      if (this.isStoredPath(trimmed)) return trimmed.replace(/^\//, '');
      return null;
    }

    const parsed = parseImageDataUrl(trimmed, limits);
    if (!parsed) return null;

    const filename = `${randomUUID()}.${parsed.ext}`;
    const relativePath = posix.join(folder, filename);
    const absolutePath = join(this.uploadRoot, folder, filename);

    await mkdir(join(this.uploadRoot, folder), { recursive: true });
    await writeFile(absolutePath, parsed.buffer);

    return relativePath;
  }

  async saveDataUrlList(
    folder: ImageUploadFolder,
    inputs?: string[] | null,
    max = MAX_LIFE_AT_IMAGES,
  ): Promise<string[]> {
    if (!inputs?.length) return [];

    const paths: string[] = [];
    for (const item of inputs.slice(0, max)) {
      const path = await this.saveDataUrl(folder, item);
      if (path) paths.push(path);
    }
    return paths;
  }

  async saveCompanyLogo(dataUrl?: string | null): Promise<string | null> {
    return this.saveDataUrl(IMAGE_UPLOAD_FOLDERS.companyLogos, dataUrl);
  }

  async saveLifeAtCompanyImages(dataUrls?: string[] | null): Promise<string[]> {
    return this.saveDataUrlList(
      IMAGE_UPLOAD_FOLDERS.lifeAtCompany,
      dataUrls,
      MAX_LIFE_AT_IMAGES,
    );
  }

  /** Keep an existing upload (path or public URL) or persist a new data URL. */
  async saveOrKeepImage(
    folder: ImageUploadFolder,
    input?: string | null,
    limits: ImageDataLimits = DEFAULT_IMAGE_LIMITS,
  ): Promise<string | null> {
    if (!input?.trim()) return null;

    const trimmed = input.trim();
    if (isImageDataUrl(trimmed, limits)) {
      return this.saveDataUrl(folder, trimmed, limits);
    }

    const existing = this.extractStoredPath(trimmed);
    if (existing) return existing;

    return null;
  }

  async saveOrKeepCompanyLogo(input?: string | null): Promise<string | null> {
    return this.saveOrKeepImage(IMAGE_UPLOAD_FOLDERS.companyLogos, input);
  }

  async saveGovernmentOrgLogo(dataUrl?: string | null): Promise<string | null> {
    return this.saveDataUrl(IMAGE_UPLOAD_FOLDERS.governmentOrgLogos, dataUrl);
  }

  async saveOrKeepGovernmentOrgLogo(input?: string | null): Promise<string | null> {
    return this.saveOrKeepImage(IMAGE_UPLOAD_FOLDERS.governmentOrgLogos, input);
  }

  async saveOrKeepRecruiterPhoto(input?: string | null): Promise<string | null> {
    return this.saveOrKeepImage(IMAGE_UPLOAD_FOLDERS.recruiterPhotos, input);
  }

  async savePlatformBannerImage(input?: string | null): Promise<string | null> {
    return this.saveOrKeepImage(
      IMAGE_UPLOAD_FOLDERS.platformBanners,
      input,
      BANNER_IMAGE_LIMITS,
    );
  }

  async saveVacancyArtwork(input?: string | null): Promise<string | null> {
    if (!input?.trim()) return null;

    const trimmed = input.trim();
    if (isVacancyArtworkDataUrl(trimmed, VACANCY_ARTWORK_LIMITS)) {
      const parsed = parseVacancyArtworkDataUrl(trimmed, VACANCY_ARTWORK_LIMITS);
      if (!parsed) return null;

      const filename = `${randomUUID()}.${parsed.ext}`;
      const folder = IMAGE_UPLOAD_FOLDERS.vacancyArtwork;
      const relativePath = posix.join(folder, filename);
      const absolutePath = join(this.uploadRoot, folder, filename);

      await mkdir(join(this.uploadRoot, folder), { recursive: true });
      await writeFile(absolutePath, parsed.buffer);

      return relativePath;
    }

    const existing = this.extractStoredPath(trimmed);
    if (existing) return existing;

    return null;
  }

  async saveOrKeepLifeAtCompanyImages(
    inputs?: string[] | null,
  ): Promise<string[]> {
    if (!inputs?.length) return [];

    const paths: string[] = [];
    for (const item of inputs.slice(0, MAX_LIFE_AT_IMAGES)) {
      const path = await this.saveOrKeepImage(
        IMAGE_UPLOAD_FOLDERS.lifeAtCompany,
        item,
      );
      if (path) paths.push(path);
    }
    return paths;
  }

  extractStoredPath(input: string): string | null {
    const trimmed = input.trim();
    if (!trimmed) return null;
    if (this.isStoredPath(trimmed)) return trimmed.replace(/^\//, '');

    const publicPrefix = `${this.publicBaseUrl}${this.publicPath}/`;
    if (trimmed.startsWith(publicPrefix)) {
      return trimmed.slice(publicPrefix.length);
    }

    const pathPrefix = `${this.publicPath}/`;
    if (trimmed.startsWith(pathPrefix)) {
      return trimmed.slice(pathPrefix.length);
    }

    return null;
  }

  resolvePublicUrl(storedPath?: string | null): string | null {
    if (!storedPath?.trim()) return null;

    const path = storedPath.trim();
    if (path.startsWith('data:')) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;

    const rel = path.replace(/^\//, '');
    return `${this.publicBaseUrl}${this.publicPath}/${rel}`;
  }

  withPublicUrls<T extends { logoUrl?: string | null; lifeAtCompanyImages?: string[] }>(
    entity: T,
  ): T {
    return {
      ...entity,
      logoUrl: this.resolvePublicUrl(entity.logoUrl),
      lifeAtCompanyImages: (entity.lifeAtCompanyImages ?? [])
        .map((item) => this.resolvePublicUrl(item))
        .filter((item): item is string => Boolean(item)),
    };
  }

  private isStoredPath(value: string): boolean {
    return !value.startsWith('data:') && !value.startsWith('http');
  }

  private normalizePublicPath(value: string): string {
    const withLeading = value.startsWith('/') ? value : `/${value}`;
    return withLeading.replace(/\/$/, '') || '/uploads';
  }
}
