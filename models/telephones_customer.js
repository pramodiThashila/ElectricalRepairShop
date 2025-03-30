module.exports = (sequelize, DataTypes) => {
  const TelephonesCustomer = sequelize.define('TelephonesCustomer', {
    phone_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    customer_id: {
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
    tableName: 'telephones_customer', // Explicitly set the table name
    timestamps: false, // Disable createdAt and updatedAt
  });

  TelephonesCustomer.associate = (models) => {
    TelephonesCustomer.belongsTo(models.Customer, { foreignKey: 'customer_id', onDelete: 'CASCADE' });
  };

  return TelephonesCustomer;
};