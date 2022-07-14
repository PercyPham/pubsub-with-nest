import { Module } from '@nestjs/common';
import { ServiceAModule } from './service-a/service-a.module';
import { ServiceBModule } from './service-b/service-b.module';

@Module({
  imports: [ServiceAModule, ServiceBModule],
})
export class AppModule {}
