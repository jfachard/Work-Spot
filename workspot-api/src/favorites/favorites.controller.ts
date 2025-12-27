import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Favorites')
@Controller('favorites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  @ApiOperation({ summary: 'Add a spot to favorites' })
  create(@Body() createFavoriteDto: CreateFavoriteDto, @Request() req) {
    return this.favoritesService.create(req.user.sub, createFavoriteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all my favorite spots' })
  findAll(@Request() req) {
    return this.favoritesService.findAll(req.user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a spot from favorites' })
  remove(@Param('id') id: string, @Request() req) {
    return this.favoritesService.remove(id, req.user.sub);
  }
}