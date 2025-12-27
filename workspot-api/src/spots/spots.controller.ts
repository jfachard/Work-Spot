import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SpotsService } from './spots.service';
import { CreateSpotDto } from './dto/create-spot.dto';
import { UpdateSpotDto } from './dto/update-spot.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Spots')
@Controller('spots')
export class SpotsController {
  constructor(private readonly spotsService: SpotsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new spot' })
  create(@Body() createSpotDto: CreateSpotDto, @Request() req) {
    return this.spotsService.create(createSpotDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all spots with optional filters' })
  @ApiQuery({ name: 'latitude', required: false, type: Number })
  @ApiQuery({ name: 'longitude', required: false, type: Number })
  @ApiQuery({ name: 'radius', required: false, type: Number, description: 'Radius in km' })
  @ApiQuery({ name: 'hasWifi', required: false, type: Boolean })
  @ApiQuery({ name: 'hasPower', required: false, type: Boolean })
  @ApiQuery({ name: 'type', required: false, enum: ['CAFE', 'LIBRARY', 'COWORKING', 'PARK', 'OTHER'] })
  findAll(
    @Query('latitude') latitude?: string,
    @Query('longitude') longitude?: string,
    @Query('radius') radius?: string,
    @Query('hasWifi') hasWifi?: string,
    @Query('hasPower') hasPower?: string,
    @Query('type') type?: string,
  ) {
    const filters = {
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      radius: radius ? parseFloat(radius) : undefined,
      hasWifi: hasWifi === 'true' ? true : hasWifi === 'false' ? false : undefined,
      hasPower: hasPower === 'true' ? true : hasPower === 'false' ? false : undefined,
      type: type || undefined,
    };

    return this.spotsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a spot by ID' })
  findOne(@Param('id') id: string) {
    return this.spotsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a spot' })
  update(
    @Param('id') id: string,
    @Body() updateSpotDto: UpdateSpotDto,
    @Request() req,
  ) {
    return this.spotsService.update(id, updateSpotDto, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a spot' })
  remove(@Param('id') id: string, @Request() req) {
    return this.spotsService.remove(id, req.user.sub);
  }
}