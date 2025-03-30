const express = require("express");
const router = express.Router(); //initializes an Express router to define routes for operations
const db = require("../config/db");
const { body, param, validationResult } = require("express-validator");

// Middleware for validation errors
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

//  Get all inventory items
router.get("/all", async (req, res) => {
    try {
        const [inventory] = await db.query("SELECT * FROM Inventory");
        res.status(200).json(inventory);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//  Get a single inventory item by ID
router.get(
    "/:id",
    [param("id").isInt().withMessage("Inventory ID must be an integer")],
    validateRequest,
    async (req, res) => {
        try {
            const [inventory] = await db.query("SELECT * FROM Inventory WHERE inventoryItem_id = ?", [
                req.params.id,
            ]);

            if (inventory.length === 0) {
                return res.status(404).json({ message: "Inventory item not found" });
            }

            res.status(200).json(inventory[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

// Add a new inventory item
router.post(
    "/addInventory",
    [
        body("item_name")
            .notEmpty().withMessage("Item name is required"),
        body("outOfStockLevel")
            .isInt({ min: 0 })
            .withMessage("Out of Stock Level must be a positive integer"),
    ],
    validateRequest,
    async (req, res) => {
        const {  item_name, outOfStockLevel } = req.body;

        try {
            const [result] = await db.query(
                "INSERT INTO inventory (name, outOfStockLevel) VALUES ( ?, ?)",
                [ item_name, outOfStockLevel]
            );

            res.status(201).json({ message: "Inventory item added successfully!", id: result.insertId });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

//  Update an inventory item
router.put(
    '/:id',
    [
        body('item_name')
            .notEmpty().withMessage("Item name is required"),
        body('outOfStockLevel')
            .isInt({ min: 0 }).withMessage('Stock limit must be a positive integer')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { Inventory_ID } = req.params;
        const { product_name, stock_limit } = req.body;

        try {
            await db.query(
                "UPDATE Inventory SET name = ?, outOfStockLevel = ? WHERE inventoryItem_id = ?",
                [product_name, stock_limit, Inventory_ID]
            );

            res.status(200).json({ message: "Inventory item updated successfully!" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

module.exports = router;
