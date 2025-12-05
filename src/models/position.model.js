// src/models/position.model.js
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';
import { User } from './user.model.js';

export class Position extends Model {}

Position.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },

    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },

    symbol: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    segment: {
      type: DataTypes.ENUM('NSEFO', 'MCX'),
      allowNull: false,
    },

    // Net open quantity (long-only in this phase)
    netQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    // Average buy price for open qty
    avgBuyPrice: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: '0.00',
    },

    // Sum of realized P&L on this scrip
    realizedPnl: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: '0.00',
    },
  },
  {
    sequelize,
    modelName: 'Position',
    tableName: 'positions',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'symbol', 'segment'],
      },
    ],
  },
);

Position.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Position, { foreignKey: 'userId', as: 'positions' });
