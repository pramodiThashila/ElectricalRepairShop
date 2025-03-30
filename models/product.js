module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    product_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    product_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    model: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    model_no: {
      type: DataTypes.STRING(30),
      unique: true,
      allowNull: false,
    },
    product_image: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: 'products', // Explicitly set the table name
    timestamps: false, // Disable createdAt and updatedAt
  });

  Product.associate = (models) => {
    Product.hasMany(models.Job, { foreignKey: 'product_id', onDelete: 'SET NULL' });
  };

  return Product;
};