import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

import { SuccessResponse } from '../dto/success-response.dto';

export function ApiWrappedOkResponse(
  model: Type<unknown>,
  description: string,
): MethodDecorator {
  return applyDecorators(
    ApiExtraModels(SuccessResponse, model),
    ApiOkResponse({
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(SuccessResponse) },
          {
            properties: {
              data: { $ref: getSchemaPath(model) },
            },
          },
        ],
      },
    }),
  );
}
