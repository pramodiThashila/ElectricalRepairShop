module.exports = (sequelize, DataTypes) => {
    const EmployeePhone = sequelize.define(
      'EmployeePhone',
      {
        phone_id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        employee_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        phone_number: {
          type: DataTypes.STRING(10),
          unique: true,
          allowNull: false,
        },
      },
      {
        tableName: "employee_phones",
        timestamps: false, // Disable createdAt and updatedAt
      }
    );
  
    EmployeePhone.associate = (models) => {
      EmployeePhone.belongsTo(models.Employee, { foreignKey: 'employee_id', onDelete: 'CASCADE' });
    };
  
    return EmployeePhone;
  };