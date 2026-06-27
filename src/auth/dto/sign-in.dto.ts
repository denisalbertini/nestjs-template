import { CreateBikerDto } from '@bikers/dto/create-biker.dto';
import { PickType } from '@nestjs/swagger';

export class SignInDto extends PickType(CreateBikerDto, [
  'email',
  'password',
] as const) {}
