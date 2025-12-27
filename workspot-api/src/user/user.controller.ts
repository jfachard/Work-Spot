import {
  Controller,
  Get,
  Body,
  Patch,
  Delete,
  UseGuards,
  Request,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get my profile' })
  getProfile(@Request() req) {
    return this.userService.getProfile(req.user.sub);
  }

  @Get('me/stats')
  @ApiOperation({ summary: 'Get my statistics' })
  getStats(@Request() req) {
    return this.userService.getUserStats(req.user.sub);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update my profile' })
  update(@Body() updateUserDto: UpdateUserDto, @Request() req) {
    return this.userService.update(req.user.sub, updateUserDto);
  }

  @Post('me/change-password')
  @ApiOperation({ summary: 'Change my password' })
  changePassword(@Body() changePasswordDto: ChangePasswordDto, @Request() req) {
    return this.userService.changePassword(req.user.sub, changePasswordDto);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Delete my account' })
  remove(@Request() req) {
    return this.userService.remove(req.user.sub);
  }
}