const express = require("express");
const db = require("../config/db");
const { body, validationResult } = require("express-validator");

const router = express.Router();

// Register Customer with Multiple Telephone Numbers
router.post(
    "/register",
    [
        body("firstName")
            .notEmpty().withMessage("First name is mandatory")
            .matches(/^[a-zA-Z']+$/).withMessage("First name should only contain letters and ' symbol")
            .isLength({ max: 10 }).withMessage("First name should not exceed 10 characters"),
        body("lastName")
            .notEmpty().withMessage("Last name is mandatory")
            .matches(/^[a-zA-Z']+$/).withMessage("Last name should only contain letters and ' symbol")
            .isLength({ max: 20 }).withMessage("Last name should not exceed 20 characters"),
        body("email")
            .notEmpty().withMessage("Email is mandatory")
            .isEmail().withMessage("Invalid email format")
            .isLength({ max: 100 }).withMessage("Email should not exceed 100 characters"),
        body("customerType")
            .notEmpty().withMessage("Customer type is mandatory")
            .isIn(["Regular", "Normal"]).withMessage("Customer type should be either 'Regular' or 'Normal'"),
        body("phoneNumbers")
            .isArray().withMessage("Phone numbers should be an array")
            .custom((phoneNumbers) => {
                for (let phone of phoneNumbers) {
                    if (!/^07\d{8}$/.test(phone)) {
                        throw new Error("Telephone number should contain 10 digits and start with 07");
                    }
                }
                return true;
            })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { firstName, lastName, email, customerType, phoneNumbers } = req.body;

            // Check if email exists
            const [existingUser] = await db.query(
                "SELECT * FROM customers WHERE email = ?",
                [email]
            );
            if (existingUser.length > 0) return res.status(400).json({ message: "Email already exists" });

            for (let phone of phoneNumbers) {
                const [existingPhone] = await db.query(
                    "SELECT * FROM customer_telephones WHERE phone_number = ?",
                    [phone]
                );
                if (existingPhone.length > 0) {
                    return res.status(400).json({ message:`Phone number ${phone} already exists` });
                }
            }

            // Insert new customer
            const [result] = await db.query(
                "INSERT INTO customers (firstName, lastName, email, type) VALUES (?, ?, ?, ?)",
                [firstName, lastName, email, customerType]
            );

            const customerId = result.insertId;

            // Insert multiple phone numbers
            if (phoneNumbers.length > 0) {
                const phoneValues = phoneNumbers.map(phone => [customerId, phone]);
                await db.query("INSERT INTO customer_telephones (customer_id, phone_number) VALUES ?", [phoneValues]);
            }

            res.status(201).json({ message: "Customer registered successfully!" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

// Update Customer (PUT - Full Update)
router.put(
    "/:id",
    [
        body("firstName").optional().isLength({ max: 10 }).withMessage("First name should not exceed 10 characters"),
        body("lastName").optional().isLength({ max: 20 }).withMessage("Last name should not exceed 20 characters"),
        body("email").optional().isEmail().withMessage("Invalid email format"),
        body("customerType").optional().isIn(["Regular", "Premium"]).withMessage("Customer type should be either 'Regular' or 'Premium'"),
        body("phoneNumbers")
            .optional()
            .isArray().withMessage("Phone numbers should be an array")
            .custom((phoneNumbers) => {
                for (let phone of phoneNumbers) {
                    if (!/^07\d{8}$/.test(phone)) {
                        throw new Error("Telephone number should contain 10 digits and start with 07");
                    }
                }
                return true;
            })
    ],
    async (req, res) => {
        const { id } = req.params;
        const { firstName, lastName, email, customerType, phoneNumbers } = req.body;

        try {
            // Check if email exists for other customers
            const [existingUser] = await db.query(
                "SELECT * FROM customers WHERE email = ? AND customer_id != ?",
                [email, id]
            );
            if (existingUser.length > 0) return res.status(400).json({ message: "Email already exists" });

            // Update customer
            await db.query(
                "UPDATE customers SET firstName = ?, lastName = ?, email = ?,  type = ? WHERE customer_id = ?",
                [firstName, lastName, email, customerType, id]
            );

            // Update multiple phone numbers
            await db.query("DELETE FROM customer_telephones WHERE customer_id = ?", [id]);
            if (phoneNumbers && phoneNumbers.length > 0) {
                const phoneValues = phoneNumbers.map(phone => [id, phone]);
                await db.query("INSERT INTO customer_telephones (customer_id, phone_number) VALUES ?", [phoneValues]);
            }

            res.status(200).json({ message: "Customer updated successfully!" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

// Partial Update (PATCH)
router.patch("/:id", async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    let updateFields = [];
    let values = [];

    for (const key in updates) {
        if (["firstName", "lastName", "email", "customerType"].includes(key)) {
            updateFields.push(`${key} = ?`);
            values.push(updates[key]);
        }
    }

    if (updateFields.length === 0) {
        return res.status(400).json({ message: "No valid fields provided for update" });
    }

    values.push(id);

    try {
        await db.query(`UPDATE customers SET ${updateFields.join(", ")} WHERE customer_id = ?`, values);
        res.status(200).json({ message: "Customer updated successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Customer
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("DELETE FROM customers WHERE customer_id = ?", [id]);
        await db.query("DELETE FROM telephones WHERE customer_id = ?", [id]);
        res.status(200).json({ message: "Customer deleted successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get All Customers
router.get("/all", async (req, res) => {
    try {
        // Fetch all customers and their phone numbers
        const [customersData] = await db.query(
            "SELECT c.*, GROUP_CONCAT(t.phone_number) AS phoneNumbers FROM customers c LEFT JOIN customer_telephones t ON c.customer_id = t.customer_id GROUP BY c.customer_id"
        );

        // Format the phoneNumbers to an array
        const customers = customersData.map(customer => {
            customer.phoneNumbers = customer.phoneNumbers ? customer.phoneNumbers.split(',') : [];
            return customer;
        });

        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Customer by ID
// Get Customer by ID with Phone Numbers
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        // Fetch customer details along with their phone numbers
        const [customerData] = await db.query(
            "SELECT c.*, GROUP_CONCAT(t.phone_number) AS phoneNumbers FROM customers c LEFT JOIN customer_telephones t ON c.customer_id = t.customer_id WHERE c.customer_id = ? GROUP BY c.customer_id",
            [id]
        );

        if (customerData.length === 0) {
            return res.status(404).json({ message: "Customer not found" });
        }

        // Parse the phone numbers to an array
        const customer = customerData[0];
        customer.phoneNumbers = customer.phoneNumbers ? customer.phoneNumbers.split(',') : [];

        res.status(200).json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Get Customer by Phone Number
router.get("/phone/:phoneNumber", async (req, res) => {
    const { phoneNumber } = req.params;
    try {
        const [customer] = await db.query(
            "SELECT c.* FROM customers c JOIN customer_telephones t ON c.customer_id = t.customer_id WHERE t.phone_number = ?",
            [phoneNumber]
        );
        if (customer.length === 0) {
            return res.status(404).json({ message: "Customer not found" });
        }
        res.status(200).json(customer[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
