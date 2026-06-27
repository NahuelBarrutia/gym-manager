import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export class Rutina extends Model {
  public id!: number;
  public nombre!: string;
  public descripcion!: string;
  public programacion_semanal!: string;
}

Rutina.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  programacion_semanal: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Rutina',
  tableName: 'rutinas',
  timestamps: false,
});
