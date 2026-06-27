import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { Cliente } from './cliente.js';

export class Pago extends Model {
  public id!: number;
  public id_cliente!: number;
  public fecha_pago!: Date;
  public monto!: number;
}

Pago.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id_cliente: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'clientes',
      key: 'id',
    },
  },
  fecha_pago: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  monto: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Pago',
  tableName: 'pagos',
  timestamps: false,
});

Pago.belongsTo(Cliente, { foreignKey: 'id_cliente', as: 'cliente' });
