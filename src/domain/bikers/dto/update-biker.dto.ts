import { MatchPropertyValue } from '@decorators/validation/match-property-value';
import { OmitType, PartialType } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';
import { CreateBikerDto } from './create-biker.dto';

export class UpdateBikerDto extends PartialType(
  OmitType(CreateBikerDto, ['cpf', 'creditCard'] as const),
) {
  @ValidateIf((o) => o.password)
  @MatchPropertyValue('password')
  confirmationPassword?: string;
}
