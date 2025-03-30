module.exports = (sequelize, DataTypes) => {
  const JobUsedInventory = sequelize.define('JobUsedInventory', {
    job_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    inventoryItem_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    batch_no: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'JobUsedInventory', // Explicitly set the table name
    timestamps: false, // Disable createdAt and updatedAt
  });

  JobUsedInventory.associate = (models) => {
    JobUsedInventory.belongsTo(models.Job, { foreignKey: 'job_ID', onDelete: 'RESTRICT' });
    JobUsedInventory.belongsTo(models.Inventory, { foreignKey: 'inventoryItem_id', onDelete: 'RESTRICT' });
    JobUsedInventory.belongsTo(models.InventoryBatch, { foreignKey: 'batch_no', onDelete: 'RESTRICT' });
  };

  return JobUsedInventory;
};