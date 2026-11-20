import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateBookDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  author?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(17)
  isbn?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  totalCopies?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  genreId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  publishedYear?: number;
}
