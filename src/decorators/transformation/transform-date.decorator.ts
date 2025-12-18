import { Transform, TransformationType } from 'class-transformer';

export function TransformDate() {
  return Transform(({ value, type }) => {
    if (value === null || value === undefined) {
      return value;
    }

    switch (type) {
      case TransformationType.CLASS_TO_PLAIN:
        if (value instanceof Date) {
          return value.toISOString();
        }
        return value;

      case TransformationType.PLAIN_TO_CLASS:
        if (typeof value === 'string') {
          return new Date(value);
        }
        return value;

      default:
        return value;
    }
  });
}
