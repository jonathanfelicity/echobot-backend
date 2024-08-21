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
   * Creates a new user in the database.
   * @param {CreateUserDto} user - The user data to be created.
   * @returns {Promise<User>} - The created user.
   */
  async create(user: CreateUserDto): Promise<User> {
    try {
      this.logger.log(`Creating a new user with email: ${user.email}`);
      const payload = {
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        website: user.website,
        address: user.address
          ? {
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
            }
          : undefined,
        company: user.company
          ? {
              create: {
                name: user.company.name,
                catch_phrase: user.company.catch_phrase,
                bs: user.company.bs,
              },
            }
          : undefined,
      };
      const createdUser = await this.prisma.user.create({
        data: payload,
      });
      this.logger.log(`User created successfully with ID: ${createdUser.id}`);
      return createdUser;
    } catch (error) {
      this.handlePrismaError(error, 'create', { email: user.email });
    }
  }

  /**
   * Fetches all users from the database.
   * @returns {Promise<User[]>} - An array of users.
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
   * Fetches a single user by ID.
   * @param {string} id - The ID of the user.
   * @returns {Promise<User>} - The fetched user or throws NotFoundException if not found.
   */
  async findOne(id: string): Promise<User> {
    try {
      this.logger.log(`Fetching user with ID: ${id}`);
      const user = await this.prisma.user.findUnique({
        where: { id },
      });
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
   * @param {string} id - The ID of the user to be updated.
   * @param {UpdateUserDto} user - The updated user data.
   * @returns {Promise<User>} - The updated user.
   */
  async update(id: string, user: UpdateUserDto): Promise<User> {
    try {
      this.logger.log(`Updating user with ID: ${id}`);
      const payload = this.buildUpdateData(user);
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
   * Deletes a user from the database.
   * @param {string} id - The ID of the user to be deleted.
   * @returns {Promise<User>} - The deleted user.
   */
  async remove(id: string): Promise<User> {
    try {
      this.logger.log(`Deleting user with ID: ${id}`);
      const deletedUser = await this.prisma.user.delete({
        where: { id },
      });
      this.logger.log(`User deleted successfully with ID: ${id}`);
      return deletedUser;
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
      `Failed to ${operation} user: ${error.message}`,
      error.stack,
      { context },
    );
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle known Prisma errors here (e.g., P2002 for unique constraint violations)
      throw new InternalServerErrorException(
        `Prisma error occurred during ${operation}`,
      );
    }
    throw new InternalServerErrorException(`Failed to ${operation} user`);
  }

  /**
   * Builds an update data object from a user object, including updates to top-level fields, address, and company.
   * @param {UpdateUserDto} user - The user object containing the updates.
   * @returns {object} - The update data object.
   */
  private buildUpdateData(user: UpdateUserDto): any {
    const updateData: any = {};

    // Add top-level fields if present
    if (user.name !== undefined) updateData.name = user.name;
    if (user.username !== undefined) updateData.username = user.username;
    if (user.email !== undefined) updateData.email = user.email;
    if (user.phone !== undefined) updateData.phone = user.phone;
    if (user.website !== undefined) updateData.website = user.website;

    // Add address update if present
    if (user.address) {
      updateData.address = {
        update: {},
      };
      if (user.address.street !== undefined)
        updateData.address.update.street = user.address.street;
      if (user.address.suite !== undefined)
        updateData.address.update.suite = user.address.suite;
      if (user.address.city !== undefined)
        updateData.address.update.city = user.address.city;
      if (user.address.zipcode !== undefined)
        updateData.address.update.zipcode = user.address.zipcode;
      if (user.address.geo) {
        updateData.address.update.geo = {
          update: {},
        };
        if (user.address.geo.lat !== undefined)
          updateData.address.update.geo.update.lat = user.address.geo.lat;
        if (user.address.geo.lng !== undefined)
          updateData.address.update.geo.update.lng = user.address.geo.lng;
      }
    }

    // Add company update if present
    if (user.company) {
      updateData.company = {
        update: {},
      };
      if (user.company.name !== undefined)
        updateData.company.update.name = user.company.name;
      if (user.company.catch_phrase !== undefined)
        updateData.company.update.catch_phrase = user.company.catch_phrase;
      if (user.company.bs !== undefined)
        updateData.company.update.bs = user.company.bs;
    }

    return updateData;
  }
}
