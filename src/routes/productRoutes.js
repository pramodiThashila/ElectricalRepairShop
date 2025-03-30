const express = require("express");
const db = require("../config/db");
const { body, validationResult } = require("express-validator");
const multer = require("multer"); //to handle file uploads
const path = require("path"); //to handle file paths

const router = express.Router();

// Multer setup for storing uploaded images
const storage = multer.diskStorage({
    destination: "./uploads/",
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage }); //Creates an upload instance of multer using the storage configuration defined above.

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
    upload.single("product_image"), // Accepts a single file with the field name "productImage"
    [
        body("product_name")
            .notEmpty().withMessage("Product name is required")
            .isLength({ max: 100 }).withMessage("Product name cannot exceed 100 characters"),
        body("model")
            .notEmpty().withMessage("Model is required")
            .isLength({ max: 50 }).withMessage("Model cannot exceed 50 characters"),
        body("model_no")
            .notEmpty().withMessage("Model number is required")
            .isLength({ max: 30 }).withMessage("Model number cannot exceed 30 characters"),
        body("product_image")
            .optional().isURL().withMessage("Invalid URL for product image")
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        try {
            const { product_name, model, model_no } = req.body;
            const product_image = req.file ? `/uploads/${req.file.filename}` : null; // Store file path

            const [result] = await db.query(
                "INSERT INTO products (product_name, model, model_no, product_image) VALUES (?, ?, ?, ?)",
                [product_name, model, model_no, product_image]
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
    upload.single("product_image"), // Optional image update
    [
        body("product_name").optional().isLength({ max: 100 }),
        body("model").optional().isLength({ max: 50 }),
        body("modelNo").optional().isAlphanumeric().isLength({ max: 30 }),
        body("product_image").optional().isURL()
    ],
    async (req, res) => {
        const { product_name, model, model_no } = req.body;
        const product_image = req.file ? `/uploads/${req.file.filename}` : null; // Store file path if available

        try {
            let query = "UPDATE products SET ";
            const params = [];

            if (product_name) { query += "product_name = ?, "; params.push(product_name); }
            if (model) { query += "model = ?, "; params.push(model); }
            if (model_no) { query += "model_no = ?, "; params.push(model_no); }
            if (product_image) { query += "product_image = ?, "; params.push(product_image); }

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
