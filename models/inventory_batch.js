module.exports = (sequelize, DataTypes) => {
  const InventoryBatch = sequelize.define('InventoryBatch', {
    batch_no: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    inventoryItem_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unitprice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    Total_Amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    Purchase_Date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    supplier_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'InventoryBatch', // Explicitly set the table name
    timestamps: false, // Disable createdAt and updatedAt
  }
);

  InventoryBatch.associate = (models) => {
    InventoryBatch.belongsTo(models.Inventory, { foreignKey: 'inventoryItem_id', onDelete: 'RESTRICT' });
    InventoryBatch.belongsTo(models.Supplier, { foreignKey: 'supplier_id', onDelete: 'RESTRICT' });
  };

  return InventoryBatch;
};