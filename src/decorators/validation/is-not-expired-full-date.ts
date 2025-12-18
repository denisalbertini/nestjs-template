import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsNotExpiredFullDate', async: false })
export class IsNotExpiredFullDateConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any): Promise<boolean> | boolean {
    if (!(value instanceof Date)) {
      return false;
    }

    const year = value.getFullYear();
    const month = value.getMonth() + 1;

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    if (year < currentYear || (year === currentYear && month < currentMonth))
      return false;

    return true;
  }

  defaultMessage(args: ValidationArguments): string {
    return '$property is expired';
  }
}

export function IsNotExpiredFullDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsNotExpiredFullDateConstraint,
    });
  };
}
