import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcryptjs';
import { Biker } from 'src/domain/bikers/entities/biker.entity';
import { BikerStatus } from 'src/domain/bikers/enums/biker-status.enum';
import { Repository } from 'typeorm';
import { AccessPurpose } from './enums/access-purpose.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Biker)
    private bikersRepository: Repository<Biker>,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, password: string): Promise<{ token: string }> {
    const biker = await this.bikersRepository.findOneBy({
      email,
      status: BikerStatus.ACTIVE,
    });

    if (!biker) {
      throw new NotFoundException();
    }

    if (!(await bcrypt.compare(password, biker.password))) {
      throw new UnauthorizedException();
    }

    return {
      token: await this.jwtService.signAsync(
        { userId: biker.id, purpose: AccessPurpose.ACCESS },
        { expiresIn: '1d' },
      ),
    };
  }

  async getEmailToken(biker: Biker): Promise<string> {
    return await this.jwtService.signAsync(
      { userId: biker.id, purpose: AccessPurpose.EMAIL_VERIFICATION },
      { expiresIn: '1d' },
    );
  }

  async verifyEmailToken(bikerId: string, token: string): Promise<void> {
    const payload = await this.jwtService.verifyAsync(token);

    if (
      bikerId !== payload.userId ||
      payload.purpose !== AccessPurpose.EMAIL_VERIFICATION
    ) {
      throw new UnauthorizedException();
    }
  }
}
