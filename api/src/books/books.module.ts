import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';

@Module({
  imports: [PassportModule],
  controllers: [BooksController],
  providers: [BooksService, JwtAuthGuard, RolesGuard],
  exports: [BooksService],
})
export class BooksModule {}
