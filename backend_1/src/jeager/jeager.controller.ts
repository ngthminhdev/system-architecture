import { Controller } from '@nestjs/common';
import { JeagerService } from './jeager.service';

@Controller()
export class JeagerController {
  constructor(private readonly jeagerService: JeagerService) {}
}
