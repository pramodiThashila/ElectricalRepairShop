const express = require("express");
const db = require("../config/db");
const { body, validationResult } = require("express-validator");

const router = express.Router();

// Register Supplier
router.post(
    "/register",
    [
        body("supplier_name")
            .notEmpty().withMessage("Supplier name is required")
            .isLength({ max: 100 }).withMessage("Supplier name should not exceed 100 characters"),
        body("email")
            .notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Invalid email format"),
        body("phone_number")
            .isArray().withMessage("Phone numbers should be an array")
            .custom((phone_numbers) => {
                for (let phone of phone_numbers) {
                    if (!/^07\d{8}$/.test(phone)) {
                        throw new Error("Phone number should contain exactly 10 digits and start from 07");
                    }
                }
                return true;
            }),
        body("address")
            .notEmpty().withMessage("Address is required")
            .isLength({ max: 255 }).withMessage("Address should not exceed 255 characters"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { supplier_name, email, phone_number, address } = req.body;

            // Check if email already exists
            const [existingSupplier] = await db.query(
                "SELECT * FROM suppliers WHERE email = ?",
                [email]
            );
            if (existingSupplier.length > 0) {
                return res.status(400).json({ message: "Supplier with this email already exists" });
            }

            for (let phone of phone_number) {
                const [existingPhone] = await db.query(
                    "SELECT * FROM supplier_phones WHERE phone_number = ?",
                    [phone]
                );
                if (existingPhone.length > 0) {
                    return res.status(400).json({ message:`Phone number ${phone} already exists` });
                }
            }

            // Insert supplier
            const [result] = await db.query(
                "INSERT INTO suppliers (supplier_name, email, address) VALUES (?, ?, ?)",
                [supplier_name, email, address]
            );

            const supplierId = result.insertId;

            // Insert multiple phone numbers
            if (phone_number.length > 0) {
                const phoneValues = phone_number.map(phone => [supplierId, phone]);
                await db.query("INSERT INTO supplier_phones (supplier_id, phone_number) VALUES ?", [phoneValues]);
            }

            res.status(201).json({ message: "Supplier registered successfully!" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

// Get All Suppliers
router.get("/all", async (req, res) => {
    try {
        const [suppliersData] = await db.query(
            "SELECT s.*, GROUP_CONCAT(sp.phone_number) AS phone_number FROM suppliers s LEFT JOIN supplier_phones sp ON s.supplier_id = sp.supplier_id GROUP BY s.supplier_id"
        );

        const suppliers = suppliersData.map(supplier => {
            supplier.phone_number = supplier.phone_number ? supplier.phone_number.split(',') : [];
            return supplier;
        });

        res.status(200).json(suppliers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Supplier by ID
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const [supplierData] = await db.query(
            "SELECT s.*, GROUP_CONCAT(sp.phone_number) AS phone_number FROM suppliers s LEFT JOIN supplier_phones sp ON s.supplier_id = sp.supplier_id WHERE s.supplier_id = ? GROUP BY s.supplier_id",
            [id]
        );

        if (supplierData.length === 0) {
            return res.status(404).json({ message: "Supplier not found" });
        }

        const supplier = supplierData[0];
        supplier.phone_number = supplier.phone_number ? supplier.phone_number.split(',') : [];

        res.status(200).json(supplier);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Supplier (Full Update)
router.put(
    "/:id",
    [
        body("supplier_name").optional().isLength({ max: 100 }),
        body("email").optional().isEmail(),
        body("address").optional().isLength({ max: 255 }),
        body("phone_numbers").optional().isArray().custom((phone_numbers) => {
            for (let phone of phone_numbers) {
                if (!/^\d{10}$/.test(phone)) {
                    throw new Error("Phone number should contain exactly 10 digits");
                }
            }
            return true;
        }),
    ],
    async (req, res) => {
        const { id } = req.params;
        const { supplier_name, email, address, phone_number} = req.body;

        try {
            await db.query(
                "UPDATE suppliers SET supplier_name = ?, email = ?, address = ? WHERE supplier_id = ?",
                [supplier_name, email, address, id]
            );

            // Update phone numbers
            await db.query("DELETE FROM supplier_phones WHERE supplier_id = ?", [id]);
            if (phone_number && phone_number.length > 0) {
                const phoneValues = phone_number.map(phone => [id, phone]);
                await db.query("INSERT INTO supplier_phones (supplier_id, phone_number) VALUES ?", [phoneValues]);
            }

            res.status(200).json({ message: "Supplier updated successfully!" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

// Delete Supplier
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("DELETE FROM suppliers WHERE supplier_id = ?", [id]);
        await db.query("DELETE FROM supplier_phones WHERE supplier_id = ?", [id]);
        res.status(200).json({ message: "Supplier deleted successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
