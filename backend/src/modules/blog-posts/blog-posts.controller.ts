import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BlogPostsService } from './blog-posts.service';

@ApiTags('blog-posts')
@Controller('blog-posts')
export class BlogPostsController {
  constructor(private readonly blogPostsService: BlogPostsService) {}

  @Get()
  list(
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    return this.blogPostsService.listPublic(search, category);
  }

  @Get('featured')
  featured() {
    return this.blogPostsService.getFeaturedPublic();
  }

  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.blogPostsService.getBySlugPublic(slug);
  }
}
