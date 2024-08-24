# Project Requirements

To ensure that the project runs smoothly, please make sure that you have the following requirements installed:

## MySQL

- **Version**: 8.0 or above
- **Description**: A relational database management system used for storing and managing data.

## Redis

- **Version**: 7.0 or above
- **Description**: An in-memory data structure store used as a database, cache, and message broker.

## Node.js

- **Version**: 18.x or above
- **Description**: A JavaScript runtime built on Chrome's V8 JavaScript engine used for building scalable network applications.

## Description

This system is designed to handle a high volume of data creation and real-time updates efficiently. The core functionalities include:

1. **Automated Data Creation**:

   - Every hour, the system automatically generates 500 new unique Autobots in the background.
   - For each newly created Autobot, 10 posts are generated.
   - Each post receives 10 associated comments, resulting in a total of 50,000 comments created per hour.

2. **Background Processing**:

   - The system leverages cron jobs and message queues to manage and streamline the data creation process.

3. **API Endpoints**:

   - The system provides endpoints to handle incoming requests with the following constraints:
     - **Rate Limiting**: Requests are limited to 5 per minute to prevent abuse.
     - **Pagination**: Each request can return up to 10 data results, ensuring efficient data retrieval and manageable response sizes.

4. **Real-Time Updates**:

   - Websockets are used to push live updates of user counts to the connected frontend, ensuring that users receive real-time information without needing to refresh their pages.

5. **API Documentation**:
   - **Swagger Documentation**: The API is documented using Swagger, providing a comprehensive and interactive way to explore and understand the available endpoints. You can access the Swagger documentation at [Echo-Bot URL](http://localhost:8081/docs)
   - **Features**: The Swagger UI offers detailed descriptions of each API endpoint, required parameters, request/response formats, and example payloads, making it easier for developers to integrate and use the API.

This architecture ensures robust handling of large volumes of data, efficient background processing, and real-time updates to provide a responsive and scalable user experience.

## Installation

```bash
$ pnpm install
$ pnpm prisma:generate
$ pnpm prisma:migrate
```

## Running the app

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

You can access the Swagger documentation at [Echo-Bot URL](http://localhost:8081/docs)

## Test

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Stay in touch

- Author - Jonathan Felicity
- email - jonathanfelicity@mail.com
- Phone - +2349130773041

## License

Nest is [MIT licensed](LICENSE).
