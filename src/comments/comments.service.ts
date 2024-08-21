import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Comment, Prisma } from '@prisma/client';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  private readonly logger: Logger;

  constructor(private readonly prisma: PrismaService) {
    this.logger = new Logger(CommentsService.name);
  }

  /**
   * Creates a new comment in the database.
   * @param {Comment} comment - The comment data to be created.
   * @returns {Promise<Comment>} - The created comment.
   */
  async create(comment: CreateCommentDto): Promise<Comment> {
    try {
      this.logger.log(`Creating a new comment with content: ${comment}`);
      const createdComment = await this.prisma.comment.create({
        data: { ...comment },
      });
      this.logger.log(
        `Comment created successfully with ID: ${createdComment.id}`,
      );
      return createdComment;
    } catch (error) {
      this.handlePrismaError(error, 'create', { content: comment });
    }
  }

  /**
   * Fetches all comments from the database.
   * @returns {Promise<Comment[]>} - An array of comments.
   */
  async findAll(): Promise<Comment[]> {
    try {
      this.logger.log('Fetching all comments');
      const comments = await this.prisma.comment.findMany();
      this.logger.log(`Fetched ${comments.length} comments`);
      return comments;
    } catch (error) {
      this.handlePrismaError(error, 'findAll');
    }
  }

  /**
   * Fetches a single comment by ID.
   * @param {string} id - The ID of the comment.
   * @returns {Promise<Comment>} - The fetched comment or throws NotFoundException if not found.
   */
  async findOne(id: string): Promise<Comment> {
    try {
      this.logger.log(`Fetching comment with ID: ${id}`);
      const comment = await this.prisma.comment.findUnique({
        where: { id },
      });
      if (!comment) {
        this.logger.warn(`Comment not found with ID: ${id}`);
        throw new NotFoundException(`Comment with ID ${id} not found`);
      }
      return comment;
    } catch (error) {
      this.handlePrismaError(error, 'findOne', { id });
    }
  }

  /**
   * Updates an existing comment in the database.
   * @param {string} id - The ID of the comment to be updated.
   * @param {Partial<Comment>} comment - The updated comment data.
   * @returns {Promise<Comment>} - The updated comment.
   */
  async update(id: string, comment: UpdateCommentDto): Promise<Comment> {
    try {
      this.logger.log(`Updating comment with ID: ${id}`);
      const updatedComment = await this.prisma.comment.update({
        where: { id },
        data: comment,
      });
      this.logger.log(`Comment updated successfully with ID: ${id}`);
      return updatedComment;
    } catch (error) {
      this.handlePrismaError(error, 'update', { id, ...comment });
    }
  }

  /**
   * Deletes a comment from the database.
   * @param {string} id - The ID of the comment to be deleted.
   * @returns {Promise<Comment>} - The deleted comment.
   */
  async remove(id: string): Promise<Comment> {
    try {
      this.logger.log(`Deleting comment with ID: ${id}`);
      const deletedComment = await this.prisma.comment.delete({
        where: { id },
      });
      this.logger.log(`Comment deleted successfully with ID: ${id}`);
      return deletedComment;
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
      `Failed to ${operation} comment: ${error.message}`,
      error.stack,
      { context },
    );
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle known Prisma errors here (e.g., P2002 for unique constraint violations)
      throw new InternalServerErrorException(
        `Prisma error occurred during ${operation}`,
      );
    }
    throw new InternalServerErrorException(`Failed to ${operation} comment`);
  }
}
