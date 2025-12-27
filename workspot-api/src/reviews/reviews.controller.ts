import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('spots/:spotId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a review for a spot' })
  @ApiParam({ name: 'spotId', description: 'Spot ID' })
  create(
    @Param('spotId') spotId: string,
    @Body() createReviewDto: CreateReviewDto,
    @Request() req,
  ) {
    return this.reviewsService.create(spotId, req.user.sub, createReviewDto);
  }

  @Get('spots/:spotId')
  @ApiOperation({ summary: 'Get all reviews for a spot' })
  @ApiParam({ name: 'spotId', description: 'Spot ID' })
  findAllBySpot(@Param('spotId') spotId: string) {
    return this.reviewsService.findAllBySpot(spotId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a review by ID' })
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update your own review' })
  update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @Request() req,
  ) {
    return this.reviewsService.update(id, req.user.sub, updateReviewDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete your own review' })
  remove(@Param('id') id: string, @Request() req) {
    return this.reviewsService.remove(id, req.user.sub);
  }
}