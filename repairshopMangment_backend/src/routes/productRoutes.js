const express = require("express");
const db = require("../config/db");
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Multer setup for storing uploaded images
const storage = multer.diskStorage({
    destination: "./uploads/",
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// const upload = multer({
//     storage: storage,
//     fileFilter: (req, file, cb) => {
//         const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
//         if (!allowedTypes.includes(file.mimetype)) {
//             return cb(new Error("Only JPEG, PNG, and JPG files are allowed"), false);
//         }
//         cb(null, true);
//     }
// });

// Create Product
router.post(
    "/add",
    upload.single("productImage"), // Accepts a single file with the field name "productImage"
    [
        body("productName")
            .notEmpty().withMessage("Product name is required")
            .isLength({ max: 100 }).withMessage("Product name cannot exceed 100 characters"),
        body("model")
            .notEmpty().withMessage("Model is required")
            .isLength({ max: 50 }).withMessage("Model cannot exceed 50 characters"),
        body("modelNo")
            .notEmpty().withMessage("Model number is required")
            .isLength({ max: 30 }).withMessage("Model number cannot exceed 30 characters"),
        body("productImage")
            .optional().isURL().withMessage("Invalid URL for product image")
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        try {
            const { productName, model, modelNo } = req.body;
            const productImage = req.file ? `/uploads/${req.file.filename}` : null; // Store file path

            const [result] = await db.query(
                "INSERT INTO products (product_name, model, model_no, product_image) VALUES (?, ?, ?, ?)",
                [productName, model, modelNo, productImage]
            );

            res.status(201).json({ message: "Product added successfully!", productId: result.insertId });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

// Get All Products
router.get("/all", async (req, res) => {
    try {
        const [products] = await db.query("SELECT * FROM products");
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Product by ID
router.get("/:id", async (req, res) => {
    try {
        const [product] = await db.query("SELECT * FROM products WHERE product_id = ?", [req.params.id]);
        if (product.length === 0) return res.status(404).json({ message: "Product not found" });

        res.status(200).json(product[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Product
router.put(
    "/:id",
    upload.single("productImage"), // Optional image update
    [
        body("productName").optional().isLength({ max: 100 }),
        body("model").optional().isLength({ max: 50 }),
        body("modelNo").optional().isAlphanumeric().isLength({ max: 30 }),
        body("productImage").optional().isURL()
    ],
    async (req, res) => {
        const { productName, model, modelNo } = req.body;
        const productImage = req.file ? `/uploads/${req.file.filename}` : null; // Store file path if available

        try {
            let query = "UPDATE products SET ";
            const params = [];

            if (productName) { query += "product_name = ?, "; params.push(productName); }
            if (model) { query += "model = ?, "; params.push(model); }
            if (modelNo) { query += "model_no = ?, "; params.push(modelNo); }
            if (productImage) { query += "product_image = ?, "; params.push(productImage); }

            // Remove last comma
            query = query.slice(0, -2) + " WHERE product_id = ?";
            params.push(req.params.id);

            await db.query(query, params);
            res.status(200).json({ message: "Product updated successfully!" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

// Delete Product
router.delete("/:id", async (req, res) => {
    try {
        await db.query("DELETE FROM products WHERE product_id = ?", [req.params.id]);
        res.status(200).json({ message: "Product deleted successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve uploaded images as static files
router.use("/uploads", express.static("uploads"));

module.exports = router;
