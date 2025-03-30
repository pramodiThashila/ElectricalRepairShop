module.exports = (sequelize, DataTypes) => {
  const Invoice = sequelize.define('Invoice', {
    Invoice_Id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    job_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    TotalCost_for_Parts: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    Advance_Amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    Labour_Cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    Total_Amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    warranty: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    Date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'Invoice', // Explicitly set the table name
    timestamps: false, // Disable createdAt and updatedAt
  });

  Invoice.associate = (models) => {
    Invoice.belongsTo(models.Job, { foreignKey: 'job_id', onDelete: 'RESTRICT' });
    Invoice.belongsTo(models.Customer, { foreignKey: 'customer_id', onDelete: 'RESTRICT' });
    Invoice.belongsTo(models.Employee, { foreignKey: 'employee_id', onDelete: 'RESTRICT' });
  };

  return Invoice;
};