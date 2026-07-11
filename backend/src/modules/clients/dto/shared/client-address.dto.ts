import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class ClientAddressDto {
  @ApiProperty({ description: 'Address identifier.', example: '550e8400-e29b-41d4-a716-446655440002' })
  id!: string;

  @ApiProperty({ description: 'Country name.', example: 'Egypt' })
  @IsString()
  @MaxLength(100)
  country!: string;

  @ApiProperty({ description: 'City name.', example: 'Cairo' })
  @IsString()
  @MaxLength(100)
  city!: string;

  @ApiPropertyOptional({ description: 'District or governorate area.', example: 'Nasr City' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  district?: string | null;

  @ApiPropertyOptional({ description: 'Street name.', example: 'Main Street' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  street?: string | null;

  @ApiPropertyOptional({ description: 'Building number.', example: '12' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  building?: string | null;

  @ApiPropertyOptional({ description: 'Floor number.', example: '3' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  floor?: string | null;

  @ApiPropertyOptional({ description: 'Postal code.', example: '11511' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string | null;

  @ApiProperty({ description: 'Indicates whether this is the primary address.', example: true })
  @IsBoolean()
  isPrimary!: boolean;

  @ApiPropertyOptional({ description: 'Creation timestamp.' })
  createdAt!: Date;
}
