import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class ClientContactDto {
  @ApiProperty({ description: 'Contact identifier.', example: '550e8400-e29b-41d4-a716-446655440001' })
  id!: string;

  @ApiProperty({ description: 'Contact full name.', example: 'Mona Ali' })
  @IsString()
  @MaxLength(150)
  name!: string;

  @ApiPropertyOptional({ description: 'Job title.', example: 'Manager' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  position?: string | null;

  @ApiPropertyOptional({ description: 'Contact phone number.', example: '01012345678' })
  @IsOptional()
  @IsString()
  @Matches(/^(\+20|0)?1[0125]\d{8}$/)
  @MaxLength(20)
  phone?: string | null;

  @ApiPropertyOptional({ description: 'Contact email address.', example: 'mona@example.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string | null;

  @ApiProperty({ description: 'Indicates whether this is the primary contact.', example: true })
  @IsBoolean()
  isPrimary!: boolean;

  @ApiPropertyOptional({ description: 'Creation timestamp.' })
  createdAt!: Date;
}
