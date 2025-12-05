// src/models/trade.model.js
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';
import { User } from './user.model.js';
import { Order } from './order.model.js';

export class Trade extends Model {}

Trade.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },

    orderId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: Order,
        key: 'id',
      },
      onDelete: 'CASCADE',
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

    side: {
      type: DataTypes.ENUM('buy', 'sell'),
      allowNull: false,
    },

    symbol: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    segment: {
      type: DataTypes.ENUM('NSEFO', 'MCX'),
      allowNull: false,
    },

    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    price: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
    },

    grossAmount: {
      // price * quantity
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
    },

    charges: {
      // brokerage, taxes (0 for now)
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: '0.00',
    },

    // cash flow:
    // BUY  => negative (debit)
    // SELL => positive (credit)
    netAmount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Trade',
    tableName: 'trades',
    timestamps: true,
  },
);

Trade.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Trade, { foreignKey: 'userId', as: 'trades' });

Trade.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
Order.hasMany(Trade, { foreignKey: 'orderId', as: 'trades' });
