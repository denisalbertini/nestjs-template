import { registerDecorator, ValidationOptions } from 'class-validator';

function isNotExpiredMonthYear(expirationDate: string): boolean {
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expirationDate)) return false;

  const [monthStr, yearStr] = expirationDate.split('/');
  const month = parseInt(monthStr, 10);
  const year = parseInt(yearStr, 10);

  const fullYear = 2000 + year;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (month < 1 || month > 12) return false;
  if (fullYear < currentYear) return false;
  if (fullYear === currentYear && month < currentMonth) return false;

  return true;
}

export function IsNotExpiredMonthYear(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNotExpiredMonthYear',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'string' && isNotExpiredMonthYear(value);
        },
        defaultMessage() {
          return 'Month/year date is expired';
        },
      },
    });
  };
}
