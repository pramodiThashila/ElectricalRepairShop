const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mysql = require("mysql2/promise"); // Import mysql2 for database creation
const db = require("./models"); // Import Sequelize models

dotenv.config();

const customerRoutes = require("./src/routes/customerRoutes");
const employeeRoutes = require("./src/routes/employeeRoutes");
const productRoutes = require("./src/routes/productRoutes");
const jobRoutes = require("./src/routes/jobRoutes");
const supplierRoutes = require("./src/routes/supplierRoutes");
const inventoryRoutes = require("./src/routes/inventoryRoutes");
const jobUsedInventoryRoutes = require("./src/routes/jobUsedInventory");
const inventoryBatchRoutes = require("./src/routes/inventoryBatch");
const invoiceRoutes = require("./src/routes/invoiceRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/customers", customerRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/products", productRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/suppliers", supplierRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/jobusedInventory", jobUsedInventoryRoutes);
app.use("/api/inventoryBatch", inventoryBatchRoutes);
app.use("/api/invoice", invoiceRoutes);

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    // Step 1: Create the database if it doesn't exist
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      port: process.env.DB_PORT || 3306,
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
    console.log(`Database "${process.env.DB_NAME}" ensured.`);

    // Step 2: Sync Sequelize models to create tables
    await db.sequelize.sync({ alter: true }); // Use { force: true } to drop and recreate tables
    console.log("All models were synchronized successfully.");

    // Step 3: Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error setting up the database:", error);
  }
})();