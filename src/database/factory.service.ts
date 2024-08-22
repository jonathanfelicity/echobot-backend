import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RequestsService } from 'src/requests/requests.service';
import { User, Comment, Post } from '@prisma/client';

@Injectable()
export default class FactoryService {
  private readonly logger: Logger;
  private readonly baseUrl: string;

  constructor(
    private readonly requestsService: RequestsService,
    private readonly configService: ConfigService,
  ) {
    this.logger = new Logger(FactoryService.name);
    this.baseUrl = this.configService.get<string>('JSONPLACEHOLDER_BASE_URL');
  }

  /**
   * Generates users from the API.
   * @param {number} count - The number of users to generate.
   * @returns {Promise<User[]>} - A promise containing the user data.
   */
  async generateUser(): Promise<any[]> {
    try {
      let users: User[] = [];
      const fetchCount = Math.ceil(500 / 10);

      for (let i = 0; i < fetchCount; i++) {
        const response = await this.requestsService.get<User[]>(
          `${this.baseUrl}/users`,
        );
        users = users.concat(response.data);
      }

      // Ensure uniqueness by modifying the users
      const uniqueUsers = users.map((user, index) => ({
        ...user,
        id: index + 1, // Unique ID
        username: `${user.username}_${index + 1}`, // Unique username
        email: `${user.email.split('@')[0]}_${index + 1}@${user.email.split('@')[1]}`, // Unique email
      }));

      return uniqueUsers.slice(0, 500); // Return exactly 500 users
    } catch (error) {
      this.logger.error(`Failed to fetch users: ${error.message}`);
      throw new HttpException(
        'Failed to fetch users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Generates posts from the API.
   * @param {number} count - The number of posts to generate.
   * @returns {Promise<Post[]>} - A promise containing the post data.
   */
  async generatePost(count?: number): Promise<Post[]> {
    return this.fetchData<Post>(`${this.baseUrl}/posts`, count);
  }

  /**
   * Generates comments from the API.
   * @param {number} count - The number of comments to generate.
   * @returns {Promise<Comment[]>} - A promise containing the comment data.
   */
  async generateComment(count?: number): Promise<Comment[]> {
    return this.fetchData<Comment>(`${this.baseUrl}/comments`, count);
  }

  /**
   * Fetches data from the given URL.
   * @param {string} url - The URL to fetch data from.
   * @param {number} [count] - The number of items to return.
   * @returns {Promise<T[]>} - A promise containing the fetched data.
   */
  private async fetchData<T>(url: string, count?: number): Promise<T[]> {
    try {
      const response = await this.requestsService.get<T[]>(url);
      const data = response.data;

      return count ? data.slice(0, count) : data;
    } catch (error) {
      this.logger.error(`Failed to fetch data from ${url}: ${error.message}`);
      throw new HttpException(
        'Failed to fetch data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
