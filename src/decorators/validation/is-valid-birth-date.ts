import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsValidBirthDate', async: false })
export class IsValidBirthDateConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments): Promise<boolean> | boolean {
    const [minAge, maxAge] = args.constraints;

    if (!(value instanceof Date) || isNaN(minAge) || isNaN(maxAge)) {
      return false;
    }

    const today = new Date();
    let age = today.getFullYear() - value.getFullYear();
    const monthDiff = today.getMonth() - value.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < value.getDate()))
      age--;

    return age >= minAge && age <= maxAge;
  }

  defaultMessage(args: ValidationArguments): string {
    const [minAge, maxAge] = args.constraints;
    return `${args.property} must represent an age between ${minAge} and ${maxAge} years`;
  }
}

export function IsValidBirthDate(
  minAge: number,
  maxAge: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [minAge, maxAge],
      validator: IsValidBirthDateConstraint,
    });
  };
}
