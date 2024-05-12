import { Controller, Get, Post } from '@nestjs/common';
import { EmployeeService } from './employee.service';

@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}
  @Post('upload')
  upload() {
    return this.employeeService.upload();
  }

  @Get('calculate')
  culculate() {
    return this.employeeService.calculate();
  }
}
