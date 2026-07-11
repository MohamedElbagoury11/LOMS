import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsDateString,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    ValidateIf,
} from 'class-validator';

import { ClientStatus } from '../../enums/client-status.enum';
import { ClientType } from '../../enums/client-type.enum';

export class CreateClientDto {
  @ApiProperty({ enum: ClientType, description: 'Client category.', example: ClientType.Individual })
  @IsEnum(ClientType)
  type!: ClientType;

  @ApiPropertyOptional({ description: 'First name for individual clients.', example: 'Ahmed' })
  @ValidateIf((o: CreateClientDto) => o.type === ClientType.Individual)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name for individual clients.', example: 'Ali' })
  @ValidateIf((o: CreateClientDto) => o.type === ClientType.Individual)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({ description: 'Company name for organization clients.', example: 'ABC Company' })
  @ValidateIf((o: CreateClientDto) => o.type === ClientType.Organization)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  organizationName?: string;

  @ApiProperty({ description: 'Primary contact phone number.', example: '01012345678' })
  @IsString()
  @Matches(/^(\+20|0)?1[0125]\d{8}$/)
  @MaxLength(20)
  phone!: string;

  @ApiPropertyOptional({ description: 'Email address.', example: 'ahmed@example.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ description: 'National ID for individual clients.', example: '12345678901234' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{14}$/)
  nationalId?: string;

  @ApiPropertyOptional({ description: 'Passport number.', example: 'A1234567' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z0-9-]+$/)
  @MaxLength(50)
  passportNumber?: string;

  @ApiPropertyOptional({ description: 'Tax number.', example: '123456789' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z0-9-/]+$/)
  @MaxLength(50)
  taxNumber?: string;

  @ApiPropertyOptional({ description: 'Commercial registration number.', example: 'CR-001' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z0-9-/]+$/)
  @MaxLength(50)
  commercialRegistration?: string;

  @ApiPropertyOptional({ description: 'Date of birth in ISO format.', example: '1990-01-01' })
  @IsOptional()
  @Type(() => Date)
  @IsDateString()
  dateOfBirth?: Date;

  @ApiPropertyOptional({ description: 'Gender.', example: 'MALE' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  gender?: string;

  @ApiPropertyOptional({ description: 'Preferred language.', example: 'en' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  preferredLanguage?: string;

  @ApiPropertyOptional({ description: 'Internal notes.', example: 'VIP customer' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;

  @ApiPropertyOptional({ enum: ClientStatus, description: 'Initial client status.', example: ClientStatus.Active })
  @IsOptional()
  @IsEnum(ClientStatus)
  status?: ClientStatus;
}
