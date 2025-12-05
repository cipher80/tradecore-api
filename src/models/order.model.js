// src/models/order.model.js
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';
import { User } from './user.model.js';

export class Order extends Model {}

Order.init(
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

    // BUY or SELL
    side: {
      type: DataTypes.ENUM('buy', 'sell'),
      allowNull: false,
    },

    // e.g. NIFTY24JANFUT, CRUDEOILFEBFUT etc.
    symbol: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    // NSEFO or MCX
    segment: {
      type: DataTypes.ENUM('NSEFO', 'MCX'),
      allowNull: false,
    },

    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },

    // Order price (we also use as execution price in this phase)
    price: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
    },

    orderType: {
      type: DataTypes.ENUM('market', 'limit'),
      allowNull: false,
      defaultValue: 'market',
    },

    status: {
      type: DataTypes.ENUM('filled', 'rejected'),
      allowNull: false,
      defaultValue: 'filled',
    },

    filledQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    avgFillPrice: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
    },

    rejectionReason: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: true,
  },
);

Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
