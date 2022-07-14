import { Controller, Get, Inject } from '@nestjs/common';
import { ServiceAService, ServiceAServiceSymbol } from './service-a.service';

@Controller('service-a')
export class ServiceAController {
  constructor(
    @Inject(ServiceAServiceSymbol)
    private readonly serviceA: ServiceAService,
  ) {}

  @Get()
  publishMessage() {
    this.serviceA.createOrderWithID(15);
    return 'OK';
  }
}
