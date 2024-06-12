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
      serviceName: 'backend_2',
      traceId128bit: true,
      // reporter: {
      //   collectorEndpoint: 'http://jaeger:14268/api/traces',
      // },
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

  finishSpan(span: any, req: any, res: any, error: any) {
    const spanContext = span.context();

    const tags = {
      [Tags.HTTP_METHOD]: req.method,
      [Tags.HTTP_URL]: req.originalUrl,
      [Tags.HTTP_STATUS_CODE]: `${res.statusCode}`,
      'http.body': JSON.stringify(req.body),
      'http.query': JSON.stringify(req.query),
    };

    if (error) {
      tags[Tags.ERROR] = 'true';
      tags['error.message'] = error?.message;
    }

    Object.keys(tags).forEach((key) => {
      span.setTag(key, tags[key]);
    });

    const traceMessage: any = {
      id: spanContext?._spanId ? spanContext?._spanId?.toString('hex') : null,
      traceId: spanContext?._traceId
        ? spanContext?._traceId?.toString('hex')
        : null,
      name: span._operationName,
      kind: Tags.SPAN_KIND_RPC_SERVER.toUpperCase(),
      duration: span._duration * 1000,
      timestamp: span._startTime * 1000,
      localEndpoint: {
        serviceName: 'backend_2',
      },
      remoteEndpoint: {
        ipv4: req.ip,
      },
      tags: tags,
    };

    if (spanContext._parentId) {
      traceMessage.parentId = spanContext._parentId.toString('hex');
    } else {
      traceMessage.parentId = spanContext._parentIdStr;
    }

    if (traceMessage.parentId) {
      // add more zero up 16 long
      traceMessage.parentId = this.padWithZeroes(traceMessage.parentId, 16);
    }

    // span.setTag(Tags.ERROR, true);
    // span.log({ 'error.message': 'error.message', 'error.stack': null });
    span.finish();
    global.logger.trace(traceMessage);
  }

  padWithZeroes(number, length) {
    let my_string = '' + number;
    while (my_string.length < length) {
      my_string = '0' + my_string;
    }
    return my_string;
  }
}
