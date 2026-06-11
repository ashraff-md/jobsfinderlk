import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { BlogPostStatus } from '@prisma/client';
export class CreateBlogPostDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(220)
  slug?: string;

  @IsString()
  @MinLength(10)
  @MaxLength(500)
  excerpt!: string;

  @IsString()
  @MinLength(20)
  content!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  category!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  authorName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  authorTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  authorBio?: string;

  @IsOptional()
  @IsString()
  authorImageUrl?: string;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  coverImageAlt?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  readMinutes?: number;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsEnum(BlogPostStatus)
  status!: BlogPostStatus;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}

export class UpdateBlogPostDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(220)
  slug?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  excerpt?: string;

  @IsOptional()
  @IsString()
  @MinLength(20)
  content?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  authorName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  authorTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  authorBio?: string;

  @IsOptional()
  @IsString()
  authorImageUrl?: string;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  coverImageAlt?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  readMinutes?: number;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsEnum(BlogPostStatus)
  status?: BlogPostStatus;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}

export class ListBlogPostsQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(BlogPostStatus)
  status?: BlogPostStatus;
}
