import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class HttpLoggerInterceptor implements NestInterceptor {
  //   private logger = new Logger('HTTP Logger');

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const {
      ip,
      method,
      originalUrl,
      body = {},
      query = {},
      headers = {},
      span = {},
    } = req;
    const startTime = Date.now();
    // const span = global.jaeger.startSpan(req);

    // global.logger.info(
    //   `url:${originalUrl}, method:${method}, ip:${ip}, body:${JSON.stringify(body)}, query:${JSON.stringify(query)}`,
    // );

    // console.log(req);
    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse();
        const { statusCode } = res;
        const responseTime = Date.now() - startTime;

        const logMessage = {
          url: originalUrl,
          method,
          ip,
          body: JSON.stringify(body),
          query: JSON.stringify(query),
          headers: JSON.stringify(headers),
          statusCode,
          responseTime,
          service: 'backend_1',
          span: JSON.stringify(span),
          payload: null,
          source: 'http',
          // timestamp: new Date().toISOString(),
        };

        global.logger.http(JSON.stringify(logMessage));
      }),
    );
  }
}
