import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmployeeModule } from './employee/employee.module';
import { Department } from 'src/models/department.model';
import { Employee } from 'src/models/employee,model';
import { Salary } from 'src/models/salary.mode';
import { Donation } from 'src/models/donation.model';

@Module({
  imports: [
    ConfigModule.forRoot(),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRESS_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      models: [Employee, Department, Donation, Salary],
      autoLoadModels: true,
      synchronize: true
    }),
    EmployeeModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
