const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const db = require('../config/db');

// Add used inventory for a job, inventory, and batch
router.post('/add/:jobId/:inventoryId/:batchNo', [
    body('Quantity_Used')
        .isInt({ min: 1 }).withMessage('Quantity Used must be a positive integer')
], async (req, res) => {
    const { jobId, inventoryId, batchNo } = req.params;
    const { Quantity_Used } = req.body;
    console.log(batchNo,inventoryId);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        // Retrieve the unit price and current quantity from the InventoryBatch table
        const [batch] = await db.query(
            "SELECT unitprice, quantity FROM inventorybatch WHERE inventoryItem_id = ? AND batch_no = ?",
            [inventoryId, batchNo]

        );


        if (batch.length === 0) {
            return res.status(404).json({ message: "Inventory batch not found" });
        }

        const unitPrice = batch[0].unitprice;
        const currentQuantity = batch[0].quantity;

        if (Quantity_Used > currentQuantity) {
            return res.status(400).json({ message: "Insufficient inventory quantity" });
        }

        const Total_Amount = unitPrice * Quantity_Used;

        // Insert the data into the JobUsedInventory table
        const [result] = await db.query(
            "INSERT INTO jobusedinventory (job_ID, inventoryItem_id , batch_no, quantity, total) VALUES (?, ?, ?, ?, ?)",
            [jobId, inventoryId, batchNo, Quantity_Used, Total_Amount]
        );

        // Update the quantity in the InventoryBatch table
        await db.query(
            "UPDATE inventorybatch SET quantity = quantity - ? WHERE inventoryItem_id = ? AND batch_no = ?",
            [Quantity_Used, inventoryId, batchNo]
        );

        res.status(201).json({ message: "Job used inventory added successfully!", id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update used inventory for a job, inventory, and batch
router.put('/update/:jobId/:inventoryId/:batchNo', [
    body('Quantity_Used')
        .isInt({ min: 1 }).withMessage('Quantity Used must be a positive integer')
], async (req, res) => {
    const { jobId, inventoryId, batchNo } = req.params;
    const { Quantity_Used } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        //retrive the current used value
        const [batch1] = await db.query(
            "SELECT  quantity FROM jobusedinventory WHERE inventoryItem_id = ? AND batch_no = ? AND job_ID = ?",
            [inventoryId, batchNo,jobId],

        );
        if (batch1.length === 0) {
            return res.status(404).json({ message: "job used inventory not found" });
        }

        const qty = batch1[0].quantity;

        //update inventory batch
        await db.query(
            "UPDATE inventorybatch SET quantity = quantity + ? WHERE inventoryItem_id = ? AND batch_no = ?",
            [qty, inventoryId, batchNo]
        );


        // Retrieve the unit price and current quantity from the InventoryBatch table
        const [batch] = await db.query(
            "SELECT unitprice, quantity FROM inventorybatch WHERE inventoryItem_id = ? AND batch_no = ?",
            [inventoryId, batchNo]
        );

        if (batch.length === 0) {
            return res.status(404).json({ message: "Inventory batch not found" });
        }

        const unitPrice = batch[0].unitprice;
        const currentQuantity = batch[0].quantity;

        if (Quantity_Used > currentQuantity) {
            return res.status(400).json({ message: "Insufficient inventory quantity" });
        }

        const Total_Amount = unitPrice * Quantity_Used;

        // Update the data in the JobUsedInventory table
        await db.query(
            "UPDATE jobusedinventory SET quantity = ?, total = ? WHERE job_id = ? AND inventoryItem_id = ? AND batch_no = ?",
            [Quantity_Used, Total_Amount, jobId, inventoryId, batchNo]
        );

        // Update the quantity in the InventoryBatch table
        await db.query(
            "UPDATE inventorybatch SET quantity = quantity - ? WHERE inventoryItem_id = ? AND batch_no = ?",
            [Quantity_Used, inventoryId, batchNo]
        );

        res.status(200).json({ message: "Job used inventory updated successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//delete jobused entry
router.delete('/delete/:jobId/:inventoryId/:batchNo', async (req, res) => {
    const { jobId, inventoryId, batchNo } = req.params;

    try {
        // Retrieve the quantity used from the JobUsedInventory table
        const [jobUsed] = await db.query(
            "SELECT quantity FROM jobusedinventory WHERE job_id = ? AND inventoryItem_id = ? AND batch_no = ?",
            [jobId, inventoryId, batchNo]
        );

        if (jobUsed.length === 0) {
            return res.status(404).json({ message: "Job used inventory not found" });
        }

        const Quantity_Used = jobUsed[0].quantity;

        // Delete the data from the JobUsedInventory table
        await db.query(
            "DELETE FROM jobusedinventory WHERE job_id = ? AND inventoryItem_id= ? AND batch_no = ?",
            [jobId, inventoryId, batchNo]
        );

        // Update the quantity in the InventoryBatch table
        await db.query(
            "UPDATE inventorybatch SET quantity = quantity + ? WHERE inventoryItem_id = ? AND batch_no = ?",
            [Quantity_Used, inventoryId, batchNo]
        );

        res.status(200).json({ message: "Job used inventory deleted successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;