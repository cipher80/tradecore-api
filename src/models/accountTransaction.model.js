// src/models/accountTransaction.model.js
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';
import { PracticeAccount } from './practiceAccount.model.js';

export class AccountTransaction extends Model {}

AccountTransaction.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },

    accountId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: PracticeAccount,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },

    type: {
      type: DataTypes.ENUM('credit', 'debit'),
      allowNull: false,
    },

    source: {
      type: DataTypes.ENUM('admin_topup', 'admin_adjust', 'trade_pnl', 'system'),
      allowNull: false,
      defaultValue: 'system',
    },

    amount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
    },

    balanceAfter: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
    },

    note: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'AccountTransaction',
    tableName: 'account_transactions',
    timestamps: true,
  },
);

AccountTransaction.belongsTo(PracticeAccount, {
  foreignKey: 'accountId',
  as: 'account',
});
PracticeAccount.hasMany(AccountTransaction, {
  foreignKey: 'accountId',
  as: 'transactions',
});
