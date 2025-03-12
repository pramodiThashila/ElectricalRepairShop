const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const db = require('../config/db');

// Get all inventory batches
router.get('/all', async (req, res) => {
    try {
        const [batches] = await db.query("SELECT * FROM inventorybatch");
        res.status(200).json(batches);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a specific inventory batch by BatchNo
router.get('/getInventoryBatch/:batch_no', async (req, res) => {
    const { batch_no } = req.params;
    try {
        const [batches] = await db.query("SELECT * FROM InventoryBatch WHERE batch_no = ?", [batch_no]);
        res.status(200).json(batches);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a new inventory batch
router.post(
    '/add',
    [
        body('inventoryItem_id')
            .isInt().withMessage('Inventory ID must be an integer'),
        body('supplier_id')
            .isInt().withMessage('Supplier ID must be an integer'),
        body('quantity')
            .isInt({ min: 1, max: 9999 }).withMessage('Quantity must be an integer between 1 and 9999'),
        body('unitprice')
            .isFloat({ min: 0.01 }).withMessage('Unit price must be a positive number'),
        body('Purchase_Date')
            .optional()
            .isISO8601().withMessage('Purchase date must be a valid date')
            .custom((value) => {
                const purchaseDate = new Date(value);
                const now = new Date();
                if (purchaseDate > now) {
                    throw new Error('Purchase date cannot be a future date');
                }
                return true;
            })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { inventoryItem_id, supplier_id, quantity, unitprice, Purchase_Date } = req.body;

        try {
            // If purchase_date is provided, use it; otherwise, use the current date
            const purchaseDate = Purchase_Date || new Date();



            const [result] = await db.query(
                "INSERT INTO inventorybatch (inventoryItem_id, quantity, unitprice, Purchase_Date, supplier_id) VALUES (?, ?, ?, ?, ?)",
                [inventoryItem_id, quantity, unitprice, purchaseDate, supplier_id]
            );

            res.status(201).json({ message: "Inventory batch added successfully!", id: result.insertId });
            const batch_no = result.insertId;


            const [result1] = await db.query(
                "INSERT INTO inventorypurchase (inventoryItem_id ,batch_no ,supplier_id ,purchaseDate , quantity ,unitprice ) VALUES ( ?, ?,?,?,?,?)",
                [inventoryItem_id,batch_no ,supplier_id,purchaseDate,quantity,unitprice]
            );

            res.status(201).json({ message: "Inventory batch added successfully to purchase!", id: result1.insertId });
            //res.status(201).json({ message: "Inventory batch added successfully!", id: result1.insertId });//to do:add data to suup item
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

// Update an existing inventory batch
router.put(
    '/updateBatch/:batch_no',
    [
        body('quantity')
            .isInt({ min: 1, max: 9999 }).withMessage('Quantity must be an integer between 1 and 9999'),
        body('unitprice')
            .isFloat({ min: 0.01 }).withMessage('Unit price must be a positive number'),
        body('supplier_id')
            .isInt().withMessage('Supplier ID must be an integer'),
        body('Purchase_Date')
            .optional()
            .isISO8601().withMessage('Purchase date must be a valid date')
            .custom((value) => {
                const purchaseDate = new Date(value);
                const now = new Date();
                if (purchaseDate > now) {
                    throw new Error('Purchase date cannot be a future date');
                }
                return true;
            })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { batch_no } = req.params;
        const { quantity, unitprice, supplier_id, Purchase_Date } = req.body;

        try {
            // If purchase_date is provided, use it; otherwise, retain the existing one
            const purchaseDate = Purchase_Date || new Date();

            await db.query(
                "UPDATE inventorybatch SET quantity = ?, unitprice = ?, Purchase_Date = ?, supplier_id = ? WHERE batch_no = ?",
                [quantity, unitprice, purchaseDate, supplier_id, batch_no]
            );

            res.status(200).json({ message: "Inventory batch updated successfully!" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

// Delete an inventory batch
router.delete('/deleteBatch/:batch_no', async (req, res) => {
    const { batch_no} = req.params;
    try {
        await db.query("DELETE FROM inventorybatch WHERE batch_no = ?", [batch_no]);
        res.status(200).json({ message: "Inventory batch deleted successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;