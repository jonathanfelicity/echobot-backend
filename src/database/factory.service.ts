import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RequestsService } from 'src/requests/requests.service';
import { User, Comment, Post } from '@prisma/client';
import { CounterService } from 'src/counter/counter.service';

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
  async generateUsers(count: number = 500): Promise<any[]> {
    try {
      let users: User[] = [];
      const fetchCount = Math.ceil(count / 10); // Adjust to fetch the required number of users
      const currentCount = await this.counterService.getCurrentCount('User');

      for (let i = 0; i < fetchCount; i++) {
        const response = await this.requestsService.get<User[]>(
          `${this.baseUrl}/users`,
        );
        users = users.concat(response.data);
      }

      // Ensure uniqueness by modifying the users
      const uniqueUsers = users.slice(0, count).map((user, index) => ({
        ...user,
        id: currentCount + index + 1, // Unique ID
        username: `${user.username}_${currentCount + index + 1}`,
        email: `${user.email.split('@')[0]}_${currentCount + index + 1}@${user.email.split('@')[1]}`, // Unique email
      }));

      // Update the count in the Counter table
      await this.counterService.incrementCount('User', uniqueUsers.length);

      return uniqueUsers; // Return exactly the number of requested users
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
  async generatePosts(count: number = 500): Promise<Post[]> {
    return this.generateItemsWithCount<Post>(
      'Post',
      `${this.baseUrl}/posts`,
      count,
    );
  }

  /**
   * Generates a list of `Comment` instances with unique IDs and other unique properties.
   *
   * @param count - The number of `Comment` instances to generate.
   * @returns A Promise that resolves to an array of `Comment` instances.
   */
  async generateComments(count: number = 500): Promise<Comment[]> {
    return this.generateItemsWithCount<Comment>(
      'Comment',
      `${this.baseUrl}/comments`,
      count,
    );
  }

  /**
   * Generates a list of items of type `T` with unique IDs and other unique properties.
   *
   * @param entity - The name of the entity being generated (e.g. 'Post', 'Comment').
   * @param url - The URL to fetch the items from.
   * @param count - The number of items to generate.
   * @returns A Promise that resolves to an array of `T` instances.
   */
  private async generateItemsWithCount<T>(
    entity: string,
    url: string,
    count: number,
  ): Promise<T[]> {
    try {
      const currentCount = await this.counterService.getCurrentCount(entity);
      let data: T[] = [];
      const fetchCount = Math.ceil(count / 10); // Adjust to fetch the required number of items

      for (let i = 0; i < fetchCount; i++) {
        const response = await this.requestsService.get<T[]>(url);
        data = data.concat(response.data);
      }

      // Ensure uniqueness by modifying the items
      const uniqueData = data.slice(0, count).map((item, index) => ({
        ...item,
        id: currentCount + index + 1, // Ensure unique ID
        // Modify other fields to ensure uniqueness if needed
      }));

      // Update the count in the Counter table
      await this.counterService.incrementCount(entity, uniqueData.length);

      return uniqueData; // Return exactly the number of requested items
    } catch (error) {
      this.logger.error(`Failed to fetch data from ${url}: ${error.message}`);
      throw new HttpException(
        'Failed to fetch data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
