const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Customer = sequelize.define('Customer', {
    customer_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    type: {
      type: DataTypes.ENUM('Regular', 'Premium'),
      allowNull: false,
    },
 },
  {
    tableName: 'customers', // Explicitly set the table name
    timestamps: false, // Disable createdAt and updatedAt
  }
);

  return Customer;
};