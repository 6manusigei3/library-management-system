import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';

@Injectable()
export class GenresService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateGenreDto) {
    try {
      return await this.prisma.genre.create({ data: dto });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('A genre with this name already exists');
      }
      throw error;
    }
  }

  findAll() {
    return this.prisma.genre.findMany({
      include: { _count: { select: { books: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    const genre = await this.prisma.genre.findUnique({
      where: { id },
      include: { _count: { select: { books: true } } },
    });
    if (!genre) {
      throw new NotFoundException(`Genre ${id} not found`);
    }
    return genre;
  }

  async update(id: string, dto: UpdateGenreDto) {
    try {
      return await this.prisma.genre.update({
        where: { id },
        data: dto,
        include: { _count: { select: { books: true } } },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Genre ${id} not found`);
        }
        if (error.code === 'P2002') {
          throw new ConflictException('A genre with this name already exists');
        }
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.genre.delete({ where: { id } });
      return { message: 'Genre deleted successfully' };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Genre ${id} not found`);
        }
        if (error.code === 'P2003') {
          throw new ConflictException('Cannot delete a genre that has books');
        }
      }
      throw error;
    }
  }
}
