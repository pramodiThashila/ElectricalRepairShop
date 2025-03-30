module.exports = (sequelize, DataTypes) => {
  const Job = sequelize.define('Job', {
    job_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    repair_description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    repair_status: {
      type: DataTypes.ENUM('pending', 'on progress', 'complete'),
      defaultValue: 'pending',
      allowNull: false,
    },
    handover_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    receive_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    estimated_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: 'jobs', // Explicitly set the table name
    timestamps: false, // Disable createdAt and updatedAt
  });

  Job.associate = (models) => {
    Job.belongsTo(models.Customer, { foreignKey: 'customer_id', onDelete: 'SET NULL' });
    Job.belongsTo(models.Employee, { foreignKey: 'employee_id', onDelete: 'SET NULL' });
    Job.belongsTo(models.Product, { foreignKey: 'product_id', onDelete: 'SET NULL' });
  };

  return Job;
};