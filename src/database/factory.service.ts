import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RequestsService } from 'src/requests/requests.service';
import { CounterService } from 'src/counter/counter.service';
import { CreateCommentDto } from 'src/comments/dto/create-comment.dto';
import { CreatePostDto } from 'src/posts/dto/create-post.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export default class FactoryService {
  private readonly logger: Logger;
  private readonly baseUrl: string;

  constructor(
    private readonly requestsService: RequestsService,
    private readonly configService: ConfigService,
    private readonly counterService: CounterService,
  ) {
    this.logger = new Logger(FactoryService.name);
    this.baseUrl = this.configService.get<string>('JSONPLACEHOLDER_BASE_URL');
  }

  /**
   * Generates a list of `User` instances with unique IDs and other unique properties.
   *
   * @param count - The number of `User` instances to generate.
   * @returns A Promise that resolves to an array of `User` instances.
   */
  async generateUsers(count: number = 500): Promise<CreateUserDto[]> {
    try {
      let users: any[] = [];
      const fetchCount = Math.ceil(count / 10); // Adjust to fetch the required number of users
      const currentCount = await this.counterService.getCurrentCount('User');

      for (let i = 0; i < fetchCount; i++) {
        const response = await this.requestsService.get<any[]>(
          `${this.baseUrl}/users`,
        );
        users = users.concat(response.data);
      }

      // Ensure uniqueness by modifying the users
      const uniqueUsers = users.slice(0, count).map((user, index) => ({
        ...user,
        id: currentCount + index + 1,
        username: `${user.username}_${currentCount + index + 1}`,
        email: `${user.email.split('@')[0]}_${currentCount + index + 1}@${user.email.split('@')[1]}`,
        phone: `${user.phone.split(' ')[0]}_${currentCount + index + 1}`,
        website: `${user.website.split('.')[0]}_${currentCount + index + 1}`,
        company: {
          ...user.company,
          name: `${user.company.name}_${currentCount + index + 1}`,
          bs: `${user.company.bs}_${currentCount + index + 1}`,
          catch_phrase: `${user.company.catchPhrase}_${currentCount + index + 1}`,
        },
      }));

      // Update the count in the Counter table
      await this.counterService.incrementCount('User', uniqueUsers.length);

      return uniqueUsers;
    } catch (error) {
      this.logger.error(`Failed to fetch users: ${error.message}`);
      throw new HttpException(
        'Failed to fetch users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Generates a list of `Post` instances with unique IDs and other unique properties.
   *
   * @param count - The number of `Post` instances to generate.
   * @returns A Promise that resolves to an array of `Post` instances.
   */
  async generatePosts(count: number = 500): Promise<any[]> {
    try {
      let posts: any[] = [];
      const fetchCount = Math.ceil(count / 10); // Adjust to fetch the required number of posts
      const currentCount = await this.counterService.getCurrentCount('Post');

      for (let i = 0; i < fetchCount; i++) {
        const response = await this.requestsService.get<CreatePostDto[]>(
          `${this.baseUrl}/posts`,
        );
        posts = posts.concat(response.data);
      }

      // Ensure uniqueness by modifying the posts
      const uniquePosts = posts.slice(0, count).map((post, index) => ({
        title: `${post.title}_${currentCount + index + 1}`, // Unique title
        body: `${post.body}_${currentCount + index + 1}`, // Unique body content
      }));

      // Update the count in the Counter table
      await this.counterService.incrementCount('Post', uniquePosts.length);

      return uniquePosts;
    } catch (error) {
      this.logger.error(`Failed to fetch posts: ${error.message}`);
      throw new HttpException(
        'Failed to fetch posts',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Generates a list of `Comment` instances with unique IDs and other unique properties.
   *
   * @param count - The number of `Comment` instances to generate.
   * @returns A Promise that resolves to an array of `Comment` instances.
   */
  async generateComments(count: number = 500): Promise<any[]> {
    try {
      let comments: any[] = [];
      const fetchCount = Math.ceil(count / 10); // Adjust to fetch the required number of comments
      const currentCount = await this.counterService.getCurrentCount('Comment');

      for (let i = 0; i < fetchCount; i++) {
        const response = await this.requestsService.get<CreateCommentDto[]>(
          `${this.baseUrl}/comments`,
        );
        comments = comments.concat(response.data);
      }

      // Ensure uniqueness by modifying the comments
      const uniqueComments = comments.slice(0, count).map((comment, index) => ({
        name: `${comment.name}_${currentCount + index + 1}`, // Unique name
        email: `${comment.email.split('@')[0]}_${currentCount + index + 1}@${comment.email.split('@')[1]}`, // Unique email
        body: `${comment.body}_${currentCount + index + 1}`, // Unique body content
      }));

      // Update the count in the Counter table
      await this.counterService.incrementCount(
        'Comment',
        uniqueComments.length,
      );

      return uniqueComments;
    } catch (error) {
      this.logger.error(`Failed to fetch comments: ${error.message}`);
      throw new HttpException(
        'Failed to fetch comments',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
