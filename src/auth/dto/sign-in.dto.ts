import { PickType } from '@nestjs/swagger';
import { CreateBikerDto } from 'src/domain/bikers/dto/create-biker.dto';

export class SignInDto extends PickType(CreateBikerDto, [
  'email',
  'password',
] as const) {}
