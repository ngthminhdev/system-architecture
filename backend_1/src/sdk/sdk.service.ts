import { Global, Injectable } from '@nestjs/common';
import axios from 'axios';
import { FORMAT_HTTP_HEADERS } from 'opentracing';

@Global()
@Injectable()
export class SdkService {
  async get(url: string, req: any) {
    const spanContext = req.span.context();
    const headers = {};
    global.jaeger.tracer.inject(spanContext, FORMAT_HTTP_HEADERS, headers);
    try {
      const response = await axios.get(url, { headers });
      // global.logger.info(`response ${JSON.stringify(response)}`);
      return response.data;
    } catch (error) {
      global.logger.error(error);
      throw error;
    }
  }
}
