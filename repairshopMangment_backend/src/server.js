const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const customerRoutes = require("./routes/customerRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const productRoutes = require("./routes/productRoutes");
const jobRoutes = require("./routes/jobRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const jobUsedInventoryRoutes = require("./routes/jobUsedInventory");
const inventoryBatchRoutes = require("./routes/inventoryBatch");
const invoiceRoutes = require('./routes/invoiceRoutes');


const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/customers", customerRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/products", productRoutes);
app.use("/api/jobs", jobRoutes);
app.use('/uploads', express.static('uploads'));
app.use("/api/suppliers", supplierRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/jobusedInventory", jobUsedInventoryRoutes);
app.use('/api/inventoryBatch', inventoryBatchRoutes);
app.use('/api/invoice', invoiceRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
