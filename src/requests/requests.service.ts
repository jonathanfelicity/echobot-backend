import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';

@Injectable()
/**
 * Generic HTTP Service for making HTTP requests.
 *
 * Provides methods for making GET, POST, and PUT requests.
 * Headers, base URL, and other options are configurable.
 */
export class RequestService {
  private readonly logger: Logger;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.logger = new Logger(RequestService.name);
  }

  /**
   * Makes a GET request.
   * @param {string} url - The URL to send the GET request to.
   * @param {object} [headers={}] - Optional headers to include in the request.
   * @returns {Promise<AxiosResponse<T>>} - A Promise containing the AxiosResponse.
   */
  async get<T>(
    url: string,
    headers: { [key: string]: string } = {},
  ): Promise<AxiosResponse<T>> {
    return this.makeRequest<T>('get', url, undefined, headers);
  }

  /**
   * Makes a POST request.
   * @param {string} url - The URL to send the POST request to.
   * @param {object} data - The data to send in the request body.
   * @param {object} [headers={}] - Optional headers to include in the request.
   * @returns {Promise<AxiosResponse<T>>} - A Promise containing the AxiosResponse.
   */
  async post<T>(
    url: string,
    data: any,
    headers: { [key: string]: string } = {},
  ): Promise<AxiosResponse<T>> {
    return this.makeRequest<T>('post', url, data, headers);
  }

  /**
   * Makes a PUT request.
   * @param {string} url - The URL to send the PUT request to.
   * @param {object} data - The data to send in the request body.
   * @param {object} [headers={}] - Optional headers to include in the request.
   * @returns {Promise<AxiosResponse<T>>} - A Promise containing the AxiosResponse.
   */
  async put<T>(
    url: string,
    data: any,
    headers: { [key: string]: string } = {},
  ): Promise<AxiosResponse<T>> {
    return this.makeRequest<T>('put', url, data, headers);
  }

  /**
   * Makes an HTTP request using Axios based on the specified method.
   * @param {string} method - The HTTP method ('get', 'post', 'put').
   * @param {string} url - The URL to make the request to.
   * @param {object} [data] - Optional data to be sent in the request payload for 'post' and 'put' requests.
   * @param {object} [headers={}] - Optional headers to include in the request.
   * @returns {Promise<AxiosResponse<T>>} - A Promise containing the AxiosResponse with the HTTP response.
   */
  private async makeRequest<T>(
    method: 'get' | 'post' | 'put',
    url: string,
    data?: any,
    headers: { [key: string]: string } = {},
  ): Promise<AxiosResponse<T>> {
    const requestOptions: any = { headers };

    try {
      const response =
        method === 'post'
          ? await this.httpService.axiosRef.post<T>(url, data, requestOptions)
          : method === 'put'
            ? await this.httpService.axiosRef.put<T>(url, data, requestOptions)
            : await this.httpService.axiosRef.get<T>(url, requestOptions);

      return response;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        `Request failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
