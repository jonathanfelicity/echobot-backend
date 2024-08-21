import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Post, Prisma } from '@prisma/client';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  private readonly logger: Logger;

  constructor(private readonly prisma: PrismaService) {
    this.logger = new Logger(PostsService.name);
  }

  /**
   * Creates a new post in the database.
   * @param {Post} post - The post data to be created.
   * @returns {Promise<Post>} - The created post.
   */
  async create(post: CreatePostDto): Promise<Post> {
    try {
      this.logger.log(`Creating a new post with title: ${post.title}`);
      const createdPost = await this.prisma.post.create({
        data: { ...post },
      });
      this.logger.log(`Post created successfully with ID: ${createdPost.id}`);
      return createdPost;
    } catch (error) {
      this.handlePrismaError(error, 'create', { title: post.title });
    }
  }

  /**
   * Fetches all posts from the database.
   * @returns {Promise<Post[]>} - An array of posts.
   */
  async findAll(): Promise<Post[]> {
    try {
      this.logger.log('Fetching all posts');
      const posts = await this.prisma.post.findMany();
      this.logger.log(`Fetched ${posts.length} posts`);
      return posts;
    } catch (error) {
      this.handlePrismaError(error, 'findAll');
    }
  }

  /**
   * Fetches a single post by ID.
   * @param {string} id - The ID of the post.
   * @returns {Promise<Post>} - The fetched post or throws NotFoundException if not found.
   */
  async findOne(id: string): Promise<Post> {
    try {
      this.logger.log(`Fetching post with ID: ${id}`);
      const post = await this.prisma.post.findUnique({
        where: { id },
      });
      if (!post) {
        this.logger.warn(`Post not found with ID: ${id}`);
        throw new NotFoundException(`Post with ID ${id} not found`);
      }
      return post;
    } catch (error) {
      this.handlePrismaError(error, 'findOne', { id });
    }
  }

  /**
   * Updates an existing post in the database.
   * @param {string} id - The ID of the post to be updated.
   * @param {Partial<Post>} post - The updated post data.
   * @returns {Promise<Post>} - The updated post.
   */
  async update(id: string, post: UpdatePostDto): Promise<Post> {
    try {
      this.logger.log(`Updating post with ID: ${id}`);
      const updatedPost = await this.prisma.post.update({
        where: { id },
        data: post,
      });
      this.logger.log(`Post updated successfully with ID: ${id}`);
      return updatedPost;
    } catch (error) {
      this.handlePrismaError(error, 'update', { id, ...post });
    }
  }

  /**
   * Deletes a post from the database.
   * @param {string} id - The ID of the post to be deleted.
   * @returns {Promise<Post>} - The deleted post.
   */
  async remove(id: string): Promise<Post> {
    try {
      this.logger.log(`Deleting post with ID: ${id}`);
      const deletedPost = await this.prisma.post.delete({
        where: { id },
      });
      this.logger.log(`Post deleted successfully with ID: ${id}`);
      return deletedPost;
    } catch (error) {
      this.handlePrismaError(error, 'remove', { id });
    }
  }

  /**
   * Handles errors for Prisma operations and logs them accordingly.
   * @param {any} error - The error object.
   * @param {string} operation - The name of the operation being performed.
   * @param {object} [context] - Additional context for logging.
   * @throws {InternalServerErrorException} - Throws an internal server error after logging.
   */
  private handlePrismaError(
    error: any,
    operation: string,
    context: object = {},
  ) {
    this.logger.error(
      `Failed to ${operation} post: ${error.message}`,
      error.stack,
      { context },
    );
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle known Prisma errors here (e.g., P2002 for unique constraint violations)
      throw new InternalServerErrorException(
        `Prisma error occurred during ${operation}`,
      );
    }
    throw new InternalServerErrorException(`Failed to ${operation} post`);
  }
}
