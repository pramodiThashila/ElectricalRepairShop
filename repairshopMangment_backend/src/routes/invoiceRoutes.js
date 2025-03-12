const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const pool = require('../config/db'); // MySQL connection pool


 //method  to check if the user is an owner

const checkOwnerRole = async (req, res, next) => {
    const { employee_id } = req.body;
    try {

        const [owner] = await pool.query("SELECT role FROM Employees WHERE employee_id  = ?", [employee_id]);
        if (owner.length === 0 || owner[0].role !== 'owner') {
            return res.status(403).json({ message: "Only owners can generate invoices" });
        }
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


  //POST: Add a new invoice

router.post('/add', [
    body('job_id').isInt().withMessage('Job ID must be an integer'),
    body('customer_id').isInt().withMessage('Customer ID must be an integer'),
    body('employee_id').isInt().withMessage('Staff ID must be an integer'),
    body('Labour_Cost').isFloat({ min: 0 }).withMessage('Labour Cost must be a positive number'),
    body('Advance_Amount').isFloat({ min: 0 }).withMessage('Advance payment must be a positive number'),
    body('warranty').isBoolean().withMessage('Warranty must be a boolean'),
    body('Date').isISO8601().withMessage('Date must be in valid format (YYYY-MM-DD)')
], checkOwnerRole, async (req, res) => {
    const { job_id, customer_id, employee_id, Labour_Cost, Advance_Amount, warranty, Date } = req.body;

    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        //  Calculate TotalCost_for_Parts
        const costQuery = `
            SELECT jui.inventoryItem_id, jui.batch_no, jui.quantity, ib.unitprice
            FROM jobusedinventory jui
            JOIN inventorybatch ib 
            ON jui.inventoryItem_id = ib.inventoryItem_id AND jui.batch_no = ib.batch_no
            WHERE jui.job_id = ?;
        `;

        const [costRows] = await pool.query(costQuery, [job_id]);

        let TotalCost_for_Parts = 0;
        costRows.forEach(row => {
            TotalCost_for_Parts += row.quantity * row.unitprice;
        });

        //  Calculate Total_Amount
        const Total_Amount = TotalCost_for_Parts + Labour_Cost;

        //  Insert new invoice into the database
        const insertQuery = `
            INSERT INTO Invoice (job_id, customer_id, employee_id, TotalCost_for_Parts, Labour_Cost, Total_Amount, Advance_Amount, warranty, Date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;

        const [result] = await pool.query(insertQuery, [
            job_id, customer_id, employee_id,TotalCost_for_Parts, Labour_Cost,Total_Amount, Advance_Amount, warranty, Date
        ]);

        res.status(201).json({
            message: 'Invoice created successfully',
            Invoice_ID: result.insertId,
            TotalCost_for_Parts,
            Total_Amount
        });
    } catch (error) {
        console.error('Error adding invoice:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Fetch all invoices

router.get('/all', async (req, res) => {
    try {
        // Fetch all invoices
        const invoiceQuery = `
            SELECT * FROM invoice;
        `;

        const [invoiceRows] = await pool.query(invoiceQuery);

        if (invoiceRows.length === 0) {
            return res.status(404).json({ error: 'No invoices found' });
        }

        res.json(invoiceRows); // Return all invoices
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Fetch an invoice by ID
router.get('/:Invoice_Id', async (req, res) => { // Removed extra space here
    const invoiceId = req.params.Invoice_Id;

    try {
        // Fetch invoice details including TotalCost_for_Parts
        const invoiceQuery = `
            SELECT * FROM invoice WHERE Invoice_Id = ?;
        `;

        const [invoiceRows] = await pool.query(invoiceQuery, [invoiceId]);

        if (invoiceRows.length === 0) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        res.json(invoiceRows[0]);
    } catch (error) {
        console.error('Error fetching invoice:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});




module.exports = router;
