import { Controller, Get, Inject } from '@nestjs/common';
import { Context } from 'src/core/context';
import { ServiceAService, ServiceAServiceSymbol } from './service-a.service';

@Controller('service-a')
export class ServiceAController {
  constructor(
    @Inject(ServiceAServiceSymbol)
    private readonly serviceA: ServiceAService,
  ) {}

  @Get()
  publishMessage() {
    const ctx = new Context({
      dbReadConn: null,
      dbWriteConn: null,
    });
    this.serviceA.createOrderWithID(ctx, 15);
    return 'OK';
  }
}
