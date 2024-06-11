import { Global, Injectable, OnModuleInit } from '@nestjs/common';
import * as tracer from 'jaeger-client';
import { FORMAT_HTTP_HEADERS, Span, Tags } from 'opentracing';

@Global()
@Injectable()
export class JeagerService implements OnModuleInit {
  tracer: tracer.JaegerTracer;

  onModuleInit() {
    this.initTracer();
  }

  initTracer() {
    const config = {
      serviceName: 'backend_1',
      traceId128bit: true,
      reporter: {
        collectorEndpoint: 'http://jaeger:14268/api/traces',
      },
      sampler: {
        type: 'const',
        param: 1,
      },
    };

    const options = {};
    this.tracer = tracer.initTracer(config, options);
  }

  startSpan(req: any): Span {
    const resource = req.path.split('/')[1] || 'root';
    const method = req.method.toLowerCase();
    const name = `${method}_${resource}`;
    const parentContext = this.tracer.extract(FORMAT_HTTP_HEADERS, req.headers);

    let span: Span;
    if (parentContext) {
      span = this.tracer.startSpan(name, { childOf: parentContext });
    } else {
      span = this.tracer.startSpan(name);
    }

    req.span = span;
    return span;
  }

  finishSpan(span: Span, req: any, res: any) {
    const tags = {
      [Tags.HTTP_METHOD]: req.method,
      [Tags.HTTP_URL]: req.originalUrl,
      [Tags.HTTP_STATUS_CODE]: `${res.statusCode}`,
      'http.body': JSON.stringify(req.body),
      'http.query': JSON.stringify(req.query),
    };

    if (res.error) {
      tags[Tags.ERROR] = 'true';
      tags['error.message'] = res.error.message;
    }

    Object.keys(tags).forEach((key) => {
      span.setTag(key, tags[key]);
    });
    span.setTag(Tags.ERROR, true);
    span.log({ 'error.message': 'error.message', 'error.stack': null });
    span.finish();
  }
}
