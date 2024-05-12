import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Employee } from './employee,model';

@Table({ tableName: 'salaries', timestamps: false })
export class Salary extends Model<Salary> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => Employee)
  @Column
  employeeId: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  amount: number;

  @Column({
    type: DataType.DATE,
  })
  date: Date;
}