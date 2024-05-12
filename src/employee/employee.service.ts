import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import * as fs from 'fs';
import { Department } from 'src/models/department.model';
import { Employee } from 'src/models/employee,model';
import { Salary } from 'src/models/salary.mode';
import { Donation } from 'src/models/donation.model';

interface IparseDumpFileReturn {
  employees: Employee[];
  salaries: Salary[];
  donations: Donation[];
  departments: Department[];
}

interface IparseRatesReturn {
  date: Date;
  currency: String;
  value: number;
}

interface IemployeeReturn {
  id: number;
  name: string;
  surname: string;
  department: Department;
  salaries: Salary[];
  donations: Donation[];
}

@Injectable()
export class EmployeeService {
  constructor(
    private sequelize: Sequelize,
    @InjectModel(Employee)
    private employeeRepository: typeof Employee,
    @InjectModel(Department)
    private departmentRepository: typeof Department,
    @InjectModel(Salary)
    private salaryRepository: typeof Salary,
    @InjectModel(Donation)
    private donationRepository: typeof Donation
  ) {}

  async calculate(): Promise<any> {
    const sqlQuery = `SELECT
    e.id AS employee_id,
    e.name AS employee_name,
    e.surname AS employee_surname,
    SUM(d.amount) AS total_donations,
    ROUND(
      CASE
        WHEN SUM(d.amount) >= 100 THEN SUM(d.amount) / (SELECT SUM(amount) FROM donations) * 10000
        ELSE 0
      END, 2) AS one_time_reward
  FROM
    employees e
  JOIN
    donations d ON e.id = d."employeeId" 
  GROUP BY
    e.id, e.name, e.surname
  HAVING
    SUM(d.amount) >= 100;`;
    try {
      const [results, metadata] = await this.sequelize.query(sqlQuery);
      return results;
    } catch (error) {
      Logger.error(error);
      throw new Error(error);
    }
  }

  async upload(): Promise<any> {
    const { employees, salaries, donations, departments } = this.parseDumpFile('./dump.txt'); //the dump file name and location are hardcoded, due to absence of other requirements
    try {
      await this.sequelize.transaction(async t => {
        await this.departmentRepository.bulkCreate(departments, {
          ignoreDuplicates: true,
          transaction: t
        });
        await this.employeeRepository.bulkCreate(employees, {
          ignoreDuplicates: true,
          transaction: t
        });
        await this.salaryRepository.bulkCreate(salaries, {
          ignoreDuplicates: true,
          transaction: t
        });
        await this.donationRepository.bulkCreate(donations, {
          ignoreDuplicates: true,
          transaction: t
        });
      });
      return { message: 'Data uploaded successfully' };
    } catch (error) {
      Logger.error(error);
      throw new Error(error);
    }
  }

  private getPropertyFromString(str: string, propertyName: string): null | string {
    const match = str.match(new RegExp(propertyName + ': .*'));
    if (match) {
      return match[0].split(':')[1].trim();
    }
    return null;
  }

  private parseEmployeeString(
    employeeStr: string,
    departmentStr: string,
    salary: string[],
    donations: string[],
    rates
  ): IemployeeReturn {
    const employeeId = +this.getPropertyFromString(employeeStr, 'id');
    const name = this.getPropertyFromString(employeeStr, 'name');
    const surname = this.getPropertyFromString(employeeStr, 'surname');
    const departmentId = +this.getPropertyFromString(departmentStr, 'id');
    const departmentName: string = this.getPropertyFromString(departmentStr, 'name');

    const convertedSalary = salary.map(statement => {
      const id = +this.getPropertyFromString(statement, 'id');
      const amount = +this.getPropertyFromString(statement, 'amount');
      const date = new Date(this.getPropertyFromString(statement, 'date'));
      return { id, amount, date, employeeId } as Salary;
    });
    const convertedDonations = donations.map(donation => {
      const id = +this.getPropertyFromString(donation, 'id');
      const originalAmount = +donation
        .match(/amount:\s*(\d+\.\d+)/)[0]
        .split(':')[1]
        .trim();
      const currency = donation.match(/amount:\s*(\d+\.\d+)\s*(\w+)/)[2];
      const date = new Date(this.getPropertyFromString(donation, 'date'));
      const exRate =
        currency === 'USD'
          ? 1
          : rates
              .filter(rate => rate.date <= date && rate.currency == currency)
              .sort((a, b) => b.date - a.date)[0]?.value;
      const amount = +(originalAmount * exRate).toFixed(2);
      return { id, amount, date, employeeId } as Donation;
    });

    return {
      id: employeeId,
      name,
      surname,
      department: {
        id: departmentId,
        name: departmentName
      } as Department,
      salaries: convertedSalary,
      donations: convertedDonations
    };
  }

  private parseRates(strLines: string): IparseRatesReturn[] {
    const ratesStr = strLines.split('Rate').slice(2);
    return ratesStr.map(rate => {
      const value = +this.getPropertyFromString(rate, 'value');
      const currency = this.getPropertyFromString(rate, 'sign');
      const date = new Date(this.getPropertyFromString(rate, 'date'));
      return {
        date,
        currency,
        value
      };
    });
  }

  private parseDumpFile(filePath: string): IparseDumpFileReturn {
    const strLines = fs.readFileSync(filePath, 'utf8');
    const employeesStr = strLines.split('  Employee').slice(1);
    const rates = this.parseRates(strLines);

    const departments: Department[] = [];
    const salaries: Salary[] = [];
    const donations: Donation[] = [];
    const employees: Employee[] = [];

    employeesStr.forEach(employee => {
      const hasDonations = employee.indexOf('Donation');
      let donation = [];
      if (hasDonations) {
        donation = employee.split('Donation').splice(1);
        employee = employee.split('Donation')[0];
      }
      const hasSalary = employee.indexOf('Salary');
      let salary = [];
      if (hasSalary) {
        salary = employee.split('Salary')[1].split('Statement').splice(1);
        employee = employee.split('Salary')[0];
      }
      const department = employee.split('Department')[1];
      employee = employee.split('Department')[0];

      const employeeObject = this.parseEmployeeString(
        employee,
        department,
        salary,
        donation,
        rates
      );

      if (!departments.find(department => department.id === employeeObject.department.id)) {
        departments.push(employeeObject.department as Department);
      }
      salaries.push(...employeeObject.salaries);
      donations.push(...employeeObject.donations);
      const { id, name, surname } = employeeObject;
      employees.push({
        id,
        name,
        surname,
        departmentId: employeeObject.department.id
      } as Employee);
    });
    return { employees, salaries, donations, departments };
  }
}
