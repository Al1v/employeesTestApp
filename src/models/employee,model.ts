import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Department } from './department.model';
import { Donation } from './donation.model';
import { Salary } from './salary.mode';

@Table({ tableName: 'employees', timestamps: false })
export class Employee extends Model<Employee> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
  })
  name: string;

  @Column({
    type: DataType.STRING,
  })
  surname: string;

  @ForeignKey(() => Department)
  @Column
  departmentId: number;

  @BelongsTo(() => Department)
  department: Department;

  @HasMany(() => Salary)
  salaries: Salary[];

  @HasMany(() => Donation)
  donations: Donation[];
}