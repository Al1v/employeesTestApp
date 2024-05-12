import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { Department } from 'src/models/department.model';
import { Employee } from 'src/models/employee,model';
import { Salary } from 'src/models/salary.mode';
import { Donation } from 'src/models/donation.model';

@Module({
  imports: [SequelizeModule.forFeature([Employee, Department, Donation, Salary])],
  controllers: [EmployeeController],
  providers: [EmployeeService]
})
export class EmployeeModule {}
