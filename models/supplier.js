module.exports = (sequelize, DataTypes) => {
  const Supplier = sequelize.define('Supplier', {
    supplier_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    supplier_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    tableName: 'suppliers', // Explicitly set the table name
    timestamps: false, // Disable createdAt and updatedAt
  });

  Supplier.associate = (models) => {
    Supplier.hasMany(models.SupplierPhone, { foreignKey: 'supplier_id', onDelete: 'CASCADE' });
  };

  return Supplier;
};