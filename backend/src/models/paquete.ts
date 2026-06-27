import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export class Paquete extends Model {
  public id!: number;
  public nombre!: string;
  public descripcion!: string;
  public precio!: number;
  public duracion_dias!: number;
  public tipo!: 'gimnasio' | 'aerobox' | 'personalizado';
}

Paquete.init({
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
    type: DataTypes.STRING,
    allowNull: false,
  },
  precio: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  duracion_dias: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tipo: {
    type: DataTypes.ENUM('gimnasio', 'aerobox', 'personalizado'),
    allowNull: false,
    defaultValue: 'gimnasio',
  },
}, {
  sequelize,
  modelName: 'Paquete',
  tableName: 'paquetes',
  timestamps: false,
});
