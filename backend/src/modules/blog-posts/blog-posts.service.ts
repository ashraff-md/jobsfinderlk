import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BlogPostStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { IMAGE_UPLOAD_FOLDERS } from '../../common/storage/image-storage.constants';
import { ImageStorageService } from '../../common/storage/image-storage.service';
import { slugify } from '../../common/utils/slug.util';
import { BLOG_CATEGORIES } from './blog-categories.constants';
import { CreateBlogPostDto, UpdateBlogPostDto } from './dto/blog-post.dto';

@Injectable()
export class BlogPostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imageStorage: ImageStorageService,
  ) {}

  private mapPost<T extends Record<string, unknown>>(post: T) {
    return {
      ...post,
      coverImageUrl: this.imageStorage.resolvePublicUrl(
        post.coverImageUrl as string | null | undefined,
      ),
      authorImageUrl: this.imageStorage.resolvePublicUrl(
        post.authorImageUrl as string | null | undefined,
      ),
    };
  }

  private publicVisibilityFilter(now = new Date()): Prisma.BlogPostWhereInput {
    return {
      OR: [
        { status: BlogPostStatus.PUBLISHED },
        {
          status: BlogPostStatus.SCHEDULED,
          scheduledAt: { lte: now },
        },
      ],
    };
  }

  private async ensureUniqueSlug(base: string, excludeId?: string) {
    let slug = slugify(base);
    if (!slug) slug = 'post';

    let candidate = slug;
    let counter = 1;
    while (true) {
      const existing = await this.prisma.blogPost.findUnique({
        where: { slug: candidate },
        select: { id: true },
      });
      if (!existing || existing.id === excludeId) return candidate;
      counter += 1;
      candidate = `${slug}-${counter}`;
    }
  }

  private validateCategory(category: string) {
    const trimmed = category.trim();
    if (trimmed.length < 2 || trimmed.length > 80) {
      throw new BadRequestException('Category must be between 2 and 80 characters.');
    }
  }

  private normalizeCategory(category: string) {
    return category.trim().replace(/\s+/g, ' ');
  }

  async listCategories() {
    const rows = await this.prisma.blogPost.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });
    const fromDb = rows.map((row) => row.category);
    return [...new Set([...BLOG_CATEGORIES, ...fromDb])].sort((a, b) =>
      a.localeCompare(b),
    );
  }

  private normalizeTags(tags?: string[]) {
    return [...new Set((tags ?? []).map((tag) => tag.trim()).filter(Boolean))];
  }

  private resolvePublishDates(
    status: BlogPostStatus,
    publishedAt?: string,
    scheduledAt?: string,
  ) {
    if (status === BlogPostStatus.DRAFT) {
      return { publishedAt: null, scheduledAt: null };
    }
    if (status === BlogPostStatus.SCHEDULED) {
      if (!scheduledAt) {
        throw new BadRequestException('Scheduled posts require a publication date.');
      }
      const date = new Date(scheduledAt);
      return { publishedAt: null, scheduledAt: date };
    }
    return {
      publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
      scheduledAt: null,
    };
  }

  private async saveCoverImage(input?: string | null) {
    return this.imageStorage.saveOrKeepImage(IMAGE_UPLOAD_FOLDERS.blogImages, input);
  }

  private async saveAuthorImage(input?: string | null) {
    return this.imageStorage.saveOrKeepImage(IMAGE_UPLOAD_FOLDERS.blogImages, input);
  }

  async listPublic(search?: string, category?: string) {
    const where: Prisma.BlogPostWhereInput = {
      AND: [
        this.publicVisibilityFilter(),
        ...(category && category !== 'All Insights' ? [{ category }] : []),
        ...(search?.trim()
          ? [
              {
                OR: [
                  { title: { contains: search.trim(), mode: 'insensitive' as const } },
                  { excerpt: { contains: search.trim(), mode: 'insensitive' as const } },
                  { authorName: { contains: search.trim(), mode: 'insensitive' as const } },
                ],
              },
            ]
          : []),
      ],
    };

    const posts = await this.prisma.blogPost.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
    });

    return posts.map((post) => this.mapPost(post));
  }

  async getFeaturedPublic() {
    const post = await this.prisma.blogPost.findFirst({
      where: {
        featured: true,
        ...this.publicVisibilityFilter(),
      },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    });

    if (!post) {
      return this.prisma.blogPost
        .findFirst({
          where: this.publicVisibilityFilter(),
          orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        })
        .then((fallback) => (fallback ? this.mapPost(fallback) : null));
    }

    return this.mapPost(post);
  }

  async getBySlugPublic(slug: string) {
    const post = await this.prisma.blogPost.findFirst({
      where: {
        slug,
        ...this.publicVisibilityFilter(),
      },
    });

    if (!post) {
      throw new NotFoundException('Article not found.');
    }

    return this.mapPost(post);
  }

  async listForAdmin(filters?: {
    search?: string;
    category?: string;
    status?: BlogPostStatus;
  }) {
    const where: Prisma.BlogPostWhereInput = {
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.category && filters.category !== 'All Categories'
        ? { category: filters.category }
        : {}),
      ...(filters?.search?.trim()
        ? {
            OR: [
              { title: { contains: filters.search.trim(), mode: 'insensitive' as const } },
              { authorName: { contains: filters.search.trim(), mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const posts = await this.prisma.blogPost.findMany({
      where,
      orderBy: [{ updatedAt: 'desc' }],
    });

    return posts.map((post) => this.mapPost(post));
  }

  async getStats() {
    const [total, drafts, scheduled, published] = await Promise.all([
      this.prisma.blogPost.count(),
      this.prisma.blogPost.count({ where: { status: BlogPostStatus.DRAFT } }),
      this.prisma.blogPost.count({ where: { status: BlogPostStatus.SCHEDULED } }),
      this.prisma.blogPost.count({ where: { status: BlogPostStatus.PUBLISHED } }),
    ]);

    return { total, drafts, scheduled, published };
  }

  async getByIdAdmin(id: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Blog post not found.');
    return this.mapPost(post);
  }

  async create(dto: CreateBlogPostDto) {
    this.validateCategory(dto.category);
    const slug = await this.ensureUniqueSlug(dto.slug?.trim() || dto.title);
    const dates = this.resolvePublishDates(dto.status, dto.publishedAt, dto.scheduledAt);

    if (dto.featured) {
      await this.prisma.blogPost.updateMany({
        where: { featured: true },
        data: { featured: false },
      });
    }

    const post = await this.prisma.blogPost.create({
      data: {
        slug,
        title: dto.title.trim(),
        excerpt: dto.excerpt.trim(),
        content: dto.content.trim(),
        category: this.normalizeCategory(dto.category),
        tags: this.normalizeTags(dto.tags),
        authorName: dto.authorName.trim(),
        authorTitle: dto.authorTitle?.trim() || null,
        authorBio: dto.authorBio?.trim() || null,
        authorImageUrl: await this.saveAuthorImage(dto.authorImageUrl),
        coverImageUrl: await this.saveCoverImage(dto.coverImageUrl),
        coverImageAlt: dto.coverImageAlt?.trim() || null,
        readMinutes: dto.readMinutes ?? 5,
        featured: dto.featured ?? false,
        status: dto.status,
        publishedAt: dates.publishedAt,
        scheduledAt: dates.scheduledAt,
      },
    });

    return this.mapPost(post);
  }

  async update(id: string, dto: UpdateBlogPostDto) {
    const existing = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Blog post not found.');

    if (dto.category) this.validateCategory(dto.category);

    const data: Prisma.BlogPostUpdateInput = {};

    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.excerpt !== undefined) data.excerpt = dto.excerpt.trim();
    if (dto.content !== undefined) data.content = dto.content.trim();
    if (dto.category !== undefined) data.category = this.normalizeCategory(dto.category);
    if (dto.tags !== undefined) data.tags = this.normalizeTags(dto.tags);
    if (dto.authorName !== undefined) data.authorName = dto.authorName.trim();
    if (dto.authorTitle !== undefined) data.authorTitle = dto.authorTitle?.trim() || null;
    if (dto.authorBio !== undefined) data.authorBio = dto.authorBio?.trim() || null;
    if (dto.readMinutes !== undefined) data.readMinutes = dto.readMinutes;
    if (dto.coverImageAlt !== undefined) data.coverImageAlt = dto.coverImageAlt?.trim() || null;

    if (dto.slug !== undefined) {
      data.slug = await this.ensureUniqueSlug(dto.slug.trim() || existing.title, id);
    } else if (dto.title !== undefined) {
      data.slug = await this.ensureUniqueSlug(dto.title, id);
    }

    if (dto.authorImageUrl !== undefined) {
      data.authorImageUrl = await this.saveAuthorImage(dto.authorImageUrl);
    }
    if (dto.coverImageUrl !== undefined) {
      data.coverImageUrl = await this.saveCoverImage(dto.coverImageUrl);
    }

    if (dto.featured !== undefined) {
      if (dto.featured) {
        await this.prisma.blogPost.updateMany({
          where: { featured: true, NOT: { id } },
          data: { featured: false },
        });
      }
      data.featured = dto.featured;
    }

    if (dto.status !== undefined) {
      const dates = this.resolvePublishDates(
        dto.status,
        dto.publishedAt,
        dto.scheduledAt ?? existing.scheduledAt?.toISOString(),
      );
      data.status = dto.status;
      data.publishedAt = dates.publishedAt;
      data.scheduledAt = dates.scheduledAt;
    } else {
      if (dto.publishedAt !== undefined) {
        data.publishedAt = dto.publishedAt ? new Date(dto.publishedAt) : null;
      }
      if (dto.scheduledAt !== undefined) {
        data.scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : null;
      }
    }

    const post = await this.prisma.blogPost.update({ where: { id }, data });
    return this.mapPost(post);
  }

  async remove(id: string) {
    const existing = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Blog post not found.');
    await this.prisma.blogPost.delete({ where: { id } });
    return { success: true };
  }
}
