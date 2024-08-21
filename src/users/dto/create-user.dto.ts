import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGEODto {
  @ApiProperty({ example: '37.7749', description: 'Latitude coordinate' })
  @IsString()
  @IsNotEmpty()
  lat: string;

  @ApiProperty({ example: '-122.4194', description: 'Longitude coordinate' })
  @IsString()
  @IsNotEmpty()
  lng: string;
}

export class CreateAddressDto {
  @ApiProperty({ example: '123 Main St', description: 'Street address' })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({ example: 'Apt 4B', description: 'Suite or apartment number' })
  @IsString()
  @IsNotEmpty()
  suite: string;

  @ApiProperty({ example: 'San Francisco', description: 'City name' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: '94105', description: 'Zipcode' })
  @IsString()
  @IsNotEmpty()
  zipcode: string;

  @ApiProperty({ type: CreateGEODto, description: 'Geographical coordinates' })
  @IsObject()
  @ValidateNested()
  @Type(() => CreateGEODto)
  geo: CreateGEODto;
}

export class CreateCompanyDto {
  @ApiProperty({ example: 'Tech Corp', description: 'Company name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Innovating the future',
    description: 'Catchphrase of the company',
  })
  @IsString()
  @IsNotEmpty()
  catch_phrase: string;

  @ApiProperty({
    example: 'Software solutions',
    description: 'Business sector',
  })
  @IsString()
  @IsNotEmpty()
  bs: string;
}

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe', description: 'User full name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'johndoe', description: 'User username' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address',
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '555-1234', description: 'User phone number' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'www.johndoe.com', description: 'User website URL' })
  @IsString()
  @IsNotEmpty()
  website: string;

  @ApiProperty({ type: CreateAddressDto, description: 'User address' })
  @IsObject()
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address: CreateAddressDto;

  @ApiProperty({ type: CreateCompanyDto, description: 'User company details' })
  @IsObject()
  @ValidateNested()
  @Type(() => CreateCompanyDto)
  company: CreateCompanyDto;
}
