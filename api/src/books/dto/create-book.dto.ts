import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  author!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(17)
  isbn!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  totalCopies!: number;

  @IsString()
  @IsNotEmpty()
  genreId!: string;

  @IsInt()
  @Min(0)
  publishedYear?: number;
}
