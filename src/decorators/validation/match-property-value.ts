import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ERROR_MESSAGES } from 'src/constants';

@ValidatorConstraint({ name: 'MatchPropertyValue', async: false })
export class MatchPropertyValueConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];

    return value === relatedValue;
  }

  defaultMessage(args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    return ERROR_MESSAGES.SHARED.MATCH_PROPERTY_VALUE(
      args.property,
      relatedPropertyName,
    );
  }
}

export function MatchPropertyValue(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: MatchPropertyValueConstraint,
    });
  };
}
