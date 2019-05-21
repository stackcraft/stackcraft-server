import bcrypt from 'bcrypt'

import assign from 'lodash/assign'

/**
 * User model
 */

const User = (sequelize, DataTypes) => {
  const passwordMinLength = 6
  const passwordMaxLength = 42
  const user = sequelize.define('user', {
    id: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
        isEmail: true,
      },
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [passwordMinLength, passwordMaxLength],
      },
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false,
      noUpdate: {
        readOnly: true,
      },
    },
    updated: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false,
    },
    roles: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    super: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    token: {
      type: DataTypes.STRING,
      defaultValue: null,
      validate: {
        notEmpty: true,
        len: 120,
      },
    },
    settings: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
  })

  /**
   * Hash password before save in database
   */

  user.beforeCreate(async newUser => {
    const generatePasswordHash = async () => {
      const saltRounds = 10
      const passwordHash = await bcrypt.hash(newUser.password, saltRounds)
      return passwordHash
    }
    assign(newUser, {
      password: await generatePasswordHash(),
    })
  })

  user.sync()

  return user
}

export default User
