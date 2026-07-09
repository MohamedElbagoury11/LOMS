import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';

import { ApiSuccessResponse } from '../interfaces/api-response.interface';

@Injectable()
export class GlobalResponseInterceptor<TData>
  implements NestInterceptor<TData, ApiSuccessResponse<TData>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<TData>,
  ): Observable<ApiSuccessResponse<TData>> {
    return next.handle().pipe(
      map((data: TData): ApiSuccessResponse<TData> => {
        return {
          success: true,
          message: 'Request completed successfully',
          data,
        };
      }),
    );
  }
}
