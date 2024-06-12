import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, tap, throwError } from 'rxjs';

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
      // span = {},
    } = req;
    const startTime = Date.now();
    const span = global.jaeger.startSpan(req);

    // global.logger.info(
    //   `url:${originalUrl}, method:${method}, ip:${ip}, body:${JSON.stringify(body)}, query:${JSON.stringify(query)}`,
    // );

    // console.log(req);
    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse();
        const { statusCode } = res;
        const responseTime = Date.now() - startTime;
        const spanContext = span.context();
        const spanLogs = {
          spanId: spanContext?._spanId
            ? spanContext?._spanId?.toString('hex')
            : null,
          traceId: spanContext?._traceId
            ? spanContext?._traceId?.toString('hex')
            : null,
        };

        const logMessage = {
          level: 'info',
          url: originalUrl,
          method,
          ip,
          body: JSON.stringify(body),
          query: JSON.stringify(query),
          headers: JSON.stringify(headers),
          statusCode,
          responseTime,
          service: 'backend_2',
          span: JSON.stringify(spanLogs),
          payload: null,
          source: 'http',
          // timestamp: new Date().toISOString(),
        };
        global.logger.http(JSON.stringify(logMessage));
        global.jaeger.finishSpan(span, req, res);
      }),
      catchError((error) => {
        const spanContext = span.context();
        const spanLogs = {
          spanId: spanContext?._spanId
            ? spanContext?._spanId?.toString('hex')
            : null,
          traceId: spanContext?._traceId
            ? spanContext?._traceId?.toString('hex')
            : null,
        };
        const res = context.switchToHttp().getResponse();
        const { status = HttpStatus.INTERNAL_SERVER_ERROR } = error;
        const responseTime = Date.now() - startTime;

        const logMessage = {
          level: 'error',
          url: originalUrl,
          method,
          ip,
          body: JSON.stringify(body),
          query: JSON.stringify(query),
          headers: JSON.stringify(headers),
          statusCode: status,
          responseTime,
          service: 'backend_2',
          span: JSON.stringify(spanLogs),
          payload: JSON.stringify({ error: error.message }),
          source: 'http',
        };

        global.logger.http(JSON.stringify(logMessage));
        global.jaeger.finishSpan(span, req, res, error);

        return throwError(error);
      }),
    );
  }
}
