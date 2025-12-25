import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}
    
    @Post('register')
    async register(
        @Body() registerDto: RegisterDto
    ) {
        return this.authService.registerUser(registerDto);
    };

    @Post('login')
    async login(
        @Body() loginDto: LoginDto
    ) {
        const user = await this.authService.findUserByEmail(loginDto.email, loginDto.password);
        if(user instanceof UnauthorizedException){
            throw user;
        }

        return this.authService.loginUser(user);
    }

    @Post('refresh')
    async refresh(
        @Body('refreshToken') token: string
    ) {
        const payload = await this.authService.verifyToken(token);
        if (payload instanceof UnauthorizedException) {
            throw payload;
        }
        const user = await this.authService.findUserById(payload.sub);

        if(user instanceof UnauthorizedException){
            throw user;
        }

        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        return this.authService.loginUser(user);
    }
}
