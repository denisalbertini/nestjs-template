import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ERROR_MESSAGES } from 'src/constants';

@ValidatorConstraint({ name: 'IsCpf', async: false })
export class IsCpfConstraint implements ValidatorConstraintInterface {
  validate(value: any): Promise<boolean> | boolean {
    if (value.length !== 11 || /^(\d)\1{10}$/.test(value)) return false;

    let sum;
    let remainder;

    // First verifier digit (J)
    sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(value.charAt(i)) * (10 - i);
    remainder = sum % 11;
    const j = remainder < 2 ? 0 : 11 - remainder;

    if (j !== parseInt(value.charAt(9))) return false;

    // Second verifier digit (K)
    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(value.charAt(i)) * (11 - i);
    remainder = sum % 11;
    const k = remainder < 2 ? 0 : 11 - remainder;

    return k === parseInt(value.charAt(10));
  }

  defaultMessage(): string {
    return ERROR_MESSAGES.BIKER.CPF;
  }
}

export function IsCpf(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCpfConstraint,
    });
  };
}
