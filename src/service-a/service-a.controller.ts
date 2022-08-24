import { Controller, Get, Inject } from '@nestjs/common';
import { ContextService, ContextServiceSymbol } from 'src/core/context';
import { ServiceAService, ServiceAServiceSymbol } from './service-a.service';

@Controller('service-a')
export class ServiceAController {
  constructor(
    @Inject(ContextServiceSymbol)
    private readonly ctxService: ContextService,
    @Inject(ServiceAServiceSymbol)
    private readonly serviceA: ServiceAService,
  ) {}

  @Get()
  async publishMessage() {
    const ctx = this.ctxService.createNewContext();
    const [trxCtx, trxFinisher] = ctx.withTransaction();
    try {
      await this.serviceA.createOrderWithID(trxCtx, 15);
      await trxFinisher.commit();
      return 'OK';
    } catch (e) {
      console.log(e);
      await trxFinisher.rollback();
      return 'Not OK';
    }
  }
}
