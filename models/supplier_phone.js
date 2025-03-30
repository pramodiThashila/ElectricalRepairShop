module.exports = (sequelize, DataTypes) => {
  const SupplierPhone = sequelize.define('SupplierPhone', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    supplier_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: 'supplier_phones', // Explicitly set the table name
    timestamps: false, // Disable createdAt and updatedAt
  });

  SupplierPhone.associate = (models) => {
    SupplierPhone.belongsTo(models.Supplier, { foreignKey: 'supplier_id', onDelete: 'CASCADE' });
  };

  return SupplierPhone;
};