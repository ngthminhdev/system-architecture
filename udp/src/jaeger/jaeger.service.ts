import { Global, Injectable, OnModuleInit } from '@nestjs/common';
import * as tracer from 'jaeger-client';
import { FORMAT_HTTP_HEADERS, Tags } from 'opentracing';

@Global()
@Injectable()
export class JaegerService implements OnModuleInit {
  tracer: tracer.JaegerTracer;
  onModuleInit() {
    // this.initTracer();
  }

  constructor(serviceName: string) {
    this.initTracer(serviceName);
  }

  initTracer(serviceName: string) {
    this.tracer = tracer.initTracer(
      {
        serviceName,
        traceId128bit: true,
        reporter: {
          collectorEndpoint: 'http://jaeger:14268/api/traces',
        },
        sampler: {
          type: 'const',
          param: 1,
        },
      },
      {},
    );
  }

  startTracing(req: any) {
    const resource = req.path.split('/')[2] || 'index';
    const method = req.method.toLowerCase();
    const name = `${method}_${resource}`;
    const parentContext = this.tracer.extract(FORMAT_HTTP_HEADERS, req.headers);

    if (parentContext) {
      req.span = this.tracer.startSpan(name, { childOf: parentContext });
    } else {
      req.span = this.tracer.startSpan(name);
    }
  }

  endTracing(req: any, res: any) {
    const span = req.span;
    span.finish();
    const context = span.context();

    const tags = {
      [Tags.HTTP_METHOD]: req.method,
      [Tags.HTTP_URL]: req.originalUrl,
      [Tags.HTTP_STATUS_CODE]: `${res.statusCode}`,
    };

    if (res._error) {
      tags[Tags.ERROR] = 'true';
      tags['error.message'] = res._error.message;
    }

    if (span.resData && Object.keys(span.resData).length > 0) {
      const body = span.resData;
      const resource = req.path.split('/')[1] || 'index';
      tags['resource.name'] = resource;

      if (body.id) tags['resource.id'] = body.id;

      if (body.code) tags['resource.code'] = body.code;
    }

    const logContent: any = {
      id: context.spanId.toString('hex'),
      traceId: context.traceId.toString('hex'),
      name: span._operationName,
      kind: Tags.SPAN_KIND_RPC_SERVER.toUpperCase(),
      duration: span._duration * 1000,
      timestamp: span._startTime * 1000,
      localEndpoint: {
        serviceName: 'udp',
      },
      remoteEndpoint: {
        ipv4: req.ip,
      },
      tags: tags,
    };

    // if (context._parentId) {
    //   logContent.parentId = context._parentId.toString('hex');
    // } else {
    //   logContent.parentId = context._parentIdStr;
    // }

    // if (logContent.parentId) {
    //   // add more zero up 16 long
    //   logContent.parentId = pad_with_zeroes(logContent.parentId, 16);
    // }

    global.logger.info(JSON.stringify(logContent));
  }

  tracing() {
    return (req, res, next) => {
      this.startTracing(req);

      const closeResponse = () => {
        res.removeListener('close', closeResponse);
        this.endTracing(req, res);
      };

      res.on('close', closeResponse);
      next();
    };
  }
}
