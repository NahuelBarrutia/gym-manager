import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { Paquete } from './paquete.js';
import { Rutina } from './rutina.js';

export class Cliente extends Model {
  public id!: number;
  public nombre!: string;
  public apellido!: string;
  public email!: string;
  public telefono!: string;
  public fecha_nacimiento!: Date;
  public activo!: boolean;
  public tipo!: 'gimnasio' | 'aerobox' | 'personalizado';
  public id_paquete!: number;
  public id_rutina!: number | null;
}

Cliente.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  apellido: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fecha_nacimiento: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  tipo: {
    type: DataTypes.ENUM('gimnasio', 'aerobox', 'personalizado'),
    allowNull: false,
    defaultValue: 'gimnasio',
  },
  id_paquete: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'paquetes',
      key: 'id',
    },
  },
  id_rutina: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'rutinas',
      key: 'id',
    },
  },
}, {
  sequelize,
  modelName: 'Cliente',
  tableName: 'clientes',
  timestamps: false,
});

Cliente.belongsTo(Paquete, { foreignKey: 'id_paquete', as: 'paquete' });
Cliente.belongsTo(Rutina, { foreignKey: 'id_rutina', as: 'rutina' });
