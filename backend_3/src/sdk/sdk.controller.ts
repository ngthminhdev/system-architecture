import { Controller } from '@nestjs/common';
import { SdkService } from './sdk.service';

@Controller()
export class SdkController {
  constructor(private readonly sdkService: SdkService) {}
}
