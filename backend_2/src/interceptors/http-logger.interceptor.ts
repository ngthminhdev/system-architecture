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
    const res = context.switchToHttp().getResponse();
    const {
      ip,
      method,
      originalUrl,
      body = {},
      query = {},
      // headers = {},
    } = req;
    const span = global.jaeger.startSpan(req);

    global.logger.info(
      `url:${originalUrl}, method:${method}, ip:${ip}, body:${JSON.stringify(body)}, query:${JSON.stringify(query)}`,
    );

    // console.log(req);
    return next.handle().pipe(
      tap(() => {
        // Kết thúc Jaeger span
        global.jaeger.finishSpan(span, req, res);
      }),
    );
  }
}
