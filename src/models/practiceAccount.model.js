// src/models/practiceAccount.model.js
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';
import { User } from './user.model.js';

export class PracticeAccount extends Model {}

PracticeAccount.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },

    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      unique: true,
      references: {
        model: User,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },

    initialAmount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: '0.00',
    },

    currentBalance: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: '0.00',
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'PracticeAccount',
    tableName: 'practice_accounts',
    timestamps: true,
  },
);

// Associations
PracticeAccount.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasOne(PracticeAccount, { foreignKey: 'userId', as: 'practiceAccount' });
