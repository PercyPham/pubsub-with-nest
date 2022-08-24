import { NestFactory } from '@nestjs/core';
import Knex from 'knex';
import { AppModule } from './app.module';
import { registerDbConnections } from './core/context';

// docker run --name mydb -e MYSQL_ROOT_PASSWORD=password -p 3306:3306 -d mysql:latest
async function connectAndRegisterDbConnections() {
  const knex = Knex({
    client: 'mysql2',
    connection: {
      host: 'localhost:3306',
      user: 'root',
      password: 'password',
      database: 'inkr_my_studio',
    },
    pool: { min: 0, max: 7 },
  });
  registerDbConnections(knex, knex);
}

async function bootstrap() {
  await connectAndRegisterDbConnections();
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
