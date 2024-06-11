import { Controller } from '@nestjs/common';
import { JaegerService } from './jaeger.service';

@Controller()
export class JaegerController {
  constructor(private readonly JaegerService: JaegerService) {}
}
