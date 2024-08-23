import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { User, Prisma } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly logger: Logger;

  constructor(private readonly prisma: PrismaService) {
    this.logger = new Logger(UsersService.name);
  }

  /**
   * Bulk creates multiple users in the database.
   *
   * @param users - An array of `CreateUserDto` objects representing the users to be created.
   * @returns A Promise that resolves to an array of `User` objects representing the newly created users.
   */
  async bulkCreate(users: CreateUserDto[]): Promise<User[]> {
    try {
      this.logger.log('Starting bulk user creation');
      const newUsers = await this.prisma.user.createMany({
        data: users.map((user) => this.buildCreatePayload(user)),
      });
      this.logger.log(`Successfully created ${newUsers.count} users`);
      return this.prisma.user.findMany({
        where: {
          email: {
            in: users.map((user) => user.email),
          },
        },
      });
    } catch (error) {
      this.logger.error(
        `Bulk user creation failed: ${error.message}`,
        error.stack,
      );
      this.handlePrismaError(error, 'bulkCreate');
    }
  }

  /**
   * Creates a new user in the database.
   *
   * @param user - A `CreateUserDto` object containing the data for the new user.
   * @returns A Promise that resolves to the newly created `User` object.
   */
  async create(user: CreateUserDto): Promise<User> {
    try {
      this.logger.log(`Creating a new user with email: ${user.email}`);
      const createdUser = await this.prisma.user.create({
        data: this.buildCreatePayload(user),
      });
      this.logger.log(`User created successfully with ID: ${createdUser.id}`);
      return createdUser;
    } catch (error) {
      this.handlePrismaError(error, 'create', { email: user.email });
    }
  }

  /**
   * Fetches all users from the database.
   *
   * @returns A Promise that resolves to an array of `User` objects representing all users in the database.
   */
  async findAll(): Promise<User[]> {
    try {
      this.logger.log('Fetching all users');
      const users = await this.prisma.user.findMany();
      this.logger.log(`Fetched ${users.length} users`);
      return users;
    } catch (error) {
      this.handlePrismaError(error, 'findAll');
    }
  }

  /**
   * Fetches a single user from the database by their unique identifier.
   *
   * @param id - The unique identifier of the user to fetch.
   * @returns A Promise that resolves to the `User` object with the specified ID, or throws a `NotFoundException` if the user is not found.
   */
  async findOne(id: string): Promise<User> {
    try {
      this.logger.log(`Fetching user with ID: ${id}`);
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) {
        this.logger.warn(`User not found with ID: ${id}`);
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    } catch (error) {
      this.handlePrismaError(error, 'findOne', { id });
    }
  }

  /**
   * Updates an existing user in the database.
   *
   * @param id - The unique identifier of the user to update.
   * @param user - The updated user data to apply.
   * @returns A Promise that resolves to the updated `User` object.
   */
  async update(id: string, user: UpdateUserDto): Promise<User> {
    try {
      this.logger.log(`Updating user with ID: ${id}`);
      const payload = this.buildUpdatePayload(user);
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: payload,
      });
      this.logger.log(`User updated successfully with ID: ${id}`);
      return updatedUser;
    } catch (error) {
      this.handlePrismaError(error, 'update', { id, ...user });
    }
  }

  /**
   * Deletes a user from the database by their unique identifier.
   *
   * @param id - The unique identifier of the user to delete.
   * @returns A Promise that resolves to the deleted `User` object.
   */
  async remove(id: string): Promise<User> {
    try {
      this.logger.log(`Deleting user with ID: ${id}`);
      const deletedUser = await this.prisma.user.delete({ where: { id } });
      this.logger.log(`User deleted successfully with ID: ${id}`);
      return deletedUser;
    } catch (error) {
      this.handlePrismaError(error, 'remove', { id });
    }
  }

  /**
   * Handles Prisma-related errors that occur during user operations.
   *
   * This method logs the error and context, and throws an appropriate exception based on the error code.
   *
   * @param error - The error object that was thrown.
   * @param operation - The name of the operation that failed (e.g. 'create', 'update', 'delete').
   * @param context - An optional object containing additional context information about the error.
   * @throws InternalServerErrorException - If the error is a Prisma client known request error with code 'P2002' (unique constraint failed), or for any other Prisma-related error.
   */
  private handlePrismaError(
    error: any,
    operation: string,
    context: object = {},
  ) {
    this.logger.error(
      `Failed to ${operation} user: ${error.message}`,
      error.stack,
      { context },
    );

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new InternalServerErrorException(
          'Unique constraint failed on the field(s)',
        );
      }
    }

    throw new InternalServerErrorException(`Failed to ${operation} user`);
  }

  /**
   * Builds the create payload for a new user based on the provided `CreateUserDto`.
   *
   * @param user - The `CreateUserDto` object containing the user data to create.
   * @returns A `Prisma.UserCreateInput` object representing the user data to be created in the database.
   */
  private buildCreatePayload(user: CreateUserDto): Prisma.UserCreateInput {
    return {
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      website: user.website,
      address: {
        create: {
          street: user.address.street,
          suite: user.address.suite,
          city: user.address.city,
          zipcode: user.address.zipcode,
          geo: {
            lat: user.address.geo.lat,
            lng: user.address.geo.lng,
          },
        },
      },
      company: {
        create: {
          name: user.company.name,
          catch_phrase: user.company.catch_phrase,
          bs: user.company.bs,
        },
      },
    };
  }

  /**
   * Builds the update payload for an existing user based on the provided user data.
   *
   * @param user - The user data object containing the fields to update.
   * @returns A `Prisma.UserUpdateInput` object representing the user data to be updated in the database.
   */
  private buildUpdatePayload(user: any): Prisma.UserUpdateInput {
    const updateData: any = {};

    if (user.name) updateData.name = user.name;
    if (user.username) updateData.username = user.username;
    if (user.email) updateData.email = user.email;
    if (user.phone) updateData.phone = user.phone;
    if (user.website) updateData.website = user.website;

    if (user.address) {
      updateData.address = {
        update: {},
      };
      if (user.address.street)
        updateData.address.update.street = user.address.street;
      if (user.address.suite)
        updateData.address.update.suite = user.address.suite;
      if (user.address.city) updateData.address.update.city = user.address.city;
      if (user.address.zipcode)
        updateData.address.update.zipcode = user.address.zipcode;
      if (user.address.geo) {
        updateData.address.update.geo = {
          lat: updateData.address.geo.lat,
          lng: updateData.address.geo.lng,
        };
      }
    }

    if (user.company) {
      updateData.company = {
        update: {},
      };
      if (user.company.name) updateData.company.update.name = user.company.name;
      if (user.company.catch_phrase)
        updateData.company.update.catch_phrase = user.company.catch_phrase;
      if (user.company.bs) updateData.company.update.bs = user.company.bs;
    }

    return updateData;
  }
}
