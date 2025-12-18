import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsValidLuhn', async: false })
export class IsValidLuhnConstraint implements ValidatorConstraintInterface {
  validate(value: any) {
    // Remove non-digit characters
    const digits = value.replace(/\D/g, '');

    // Check if the input contains at least one digit
    if (digits.length === 0) return false;

    let sum = 0;
    let isEvenPosition = false;

    // Process digits from right to left
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i], 10);

      // Double every second digit from the right
      if (isEvenPosition) {
        digit *= 2;
        // Subtract 9 if result is greater than 9
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEvenPosition = !isEvenPosition;
    }

    // Valid if sum is divisible by 10
    return sum % 10 === 0;
  }

  defaultMessage(args: ValidationArguments) {
    return '$property is not Luhn valid';
  }
}

export function IsValidLuhn(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidLuhnConstraint,
    });
  };
}
