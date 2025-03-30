module.exports = (sequelize, DataTypes) => {
  const InventoryPurchase = sequelize.define('InventoryPurchase', {
    purchase_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    inventoryItem_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    batch_no: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    supplier_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    purchaseDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unitprice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    total: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
  },
  {
    tableName: 'InventoryPurchase', // Explicitly set the table name
    timestamps: false, // Disable createdAt and updatedAt
  });

  InventoryPurchase.associate = (models) => {
    InventoryPurchase.belongsTo(models.Inventory, { foreignKey: 'inventoryItem_id', onDelete: 'RESTRICT' });
    InventoryPurchase.belongsTo(models.InventoryBatch, { foreignKey: 'batch_no', onDelete: 'RESTRICT' });
    InventoryPurchase.belongsTo(models.Supplier, { foreignKey: 'supplier_id', onDelete: 'RESTRICT' });
  };

  return InventoryPurchase;
};