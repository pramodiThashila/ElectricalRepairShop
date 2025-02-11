const express = require("express");
const db = require("../config/db");
const { body, validationResult } = require("express-validator");
const moment = require("moment");

const router = express.Router();

// Register Employee with Multiple Telephone Numbers
router.post(
    "/register",
    [
        body("firstName")
            .notEmpty().withMessage("First name is mandatory")
            .matches(/^[a-zA-Z']+$/).withMessage("First name should only contain letters and ' symbol")
            .isLength({ max: 50 }).withMessage("First name should not exceed 50 characters"),
        body("lastName")
            .notEmpty().withMessage("Last name is mandatory")
            .matches(/^[a-zA-Z']+$/).withMessage("Last name should only contain letters and ' symbol")
            .isLength({ max: 50 }).withMessage("Last name should not exceed 50 characters"),
        body("email")
            .notEmpty().withMessage("Email is mandatory")
            .isEmail().withMessage("Invalid email format")
            .isLength({ max: 100 }).withMessage("Email should not exceed 100 characters"),
        body("mobileno")
            .isArray().withMessage("Phone numbers should be an array")
            .custom((mobileno) => {
                for (let phone of mobileno) {
                    if (!/^07\d{8}$/.test(phone)) {
                        throw new Error("Telephone number should contain 10 digits and start with 07");
                    }
                }
                return true;
            }),
        body("nic")
            .notEmpty().withMessage("NIC is mandatory")
            .matches(/^(?:\d{9}[Vv]|\d{12})$/).withMessage("Invalid NIC format. Should be 9 digits followed by V or 12 digits."),
        body("role")
            .notEmpty().withMessage("Role is mandatory")
            .isIn(["owner", "employee"]).withMessage("Role should be either 'owner' or 'employee'"),
        body("username")
            .notEmpty().withMessage("Username is mandatory")
            .isLength({ min: 5, max: 50 }).withMessage("Username should be between 5 to 50 characters"),
        body("password")
            .notEmpty().withMessage("Password is mandatory")
            .isLength({ min: 6 }).withMessage("Password should be at least 6 characters long"),
        body("dob")
            .notEmpty().withMessage("Date of birth is mandatory")
            .isDate().withMessage("Invalid date format")
            .custom((value) => {
                const dateOfBirth = moment(value);
                const now = moment();
                const age = now.diff(dateOfBirth, 'years');
                if (dateOfBirth.isAfter(now)) {
                    throw new Error("Date of birth cannot be a future date");
                }
                if (age < 18) {
                    throw new Error("Employee must be at least 18 years old");
                }
                return true;
            }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { firstName, lastName, email, mobileno, nic, role, username, password, dob } = req.body;

            // Check if email exists
            const [existingUser] = await db.query(
                "SELECT * FROM employees WHERE email = ?",
                [email]
            );
            if (existingUser.length > 0) return res.status(400).json({ message: "Email already exists" });

            // Check if username exists
            const [existingUsername] = await db.query(
                "SELECT * FROM employees WHERE username = ?",
                [username]
            );
            if (existingUsername.length > 0) return res.status(400).json({ message: "Username already exists" });

            for (let phone of mobileno) {
                const [existingPhone] = await db.query(
                    "SELECT * FROM employee_phones WHERE phone_number = ?",
                    [phone]
                );
                if (existingPhone.length > 0) {
                    return res.status(400).json({ message: `Phone number ${phone} already exists` });
                }
            }

            // Insert new employee
            const [result] = await db.query(
                "INSERT INTO employees (first_name, last_name, email, nic, role, username, password, dob) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [firstName, lastName, email, nic, role, username, password, dob]
            );

            const employeeId = result.insertId;

            // Insert multiple phone numbers
            if (mobileno.length > 0) {
                const phoneValues = mobileno.map(phone => [employeeId, phone]);
                await db.query("INSERT INTO employee_phones (employee_id, phone_number) VALUES ?", [phoneValues]);
            }

            res.status(201).json({ message: "Employee registered successfully!" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);


// Get All Employees
router.get("/all", async (req, res) => {
    try {
        const [employeesData] = await db.query(
            "SELECT e.*, GROUP_CONCAT(p.phone_number) AS phoneNumbers FROM employees e LEFT JOIN employee_phones p ON e.employee_id = p.employee_id GROUP BY e.employee_id"
        );

        const employees = employeesData.map(employee => {
            employee.phoneNumbers = employee.phoneNumbers ? employee.phoneNumbers.split(',') : [];
            return employee;
        });

        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Employee by ID
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const [employeeData] = await db.query(
            "SELECT e.*, GROUP_CONCAT(p.phone_number) AS phoneNumbers FROM employees e LEFT JOIN employee_phones p ON e.employee_id = p.employee_id WHERE e.employee_id = ? GROUP BY e.employee_id",
            [id]
        );

        if (employeeData.length === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }

        const employee = employeeData[0];
        employee.phoneNumbers = employee.phoneNumbers ? employee.phoneNumbers.split(',') : [];

        res.status(200).json(employee);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Update Employee (PUT - Full Update)
router.put(
    "/:id",
    [
        body("firstName").optional().isLength({ max: 50 }),
        body("lastName").optional().isLength({ max: 50 }),
        body("email").optional().isEmail(),
        body("role").optional().isIn(["owner", "employee"]),
        body("mobileno").optional().isArray().custom((mobilenos) => {
            for (let phone of mobilenos) {
                if (!/^07\d{8}$/.test(phone)) {
                    throw new Error("Mobile number should contain 10 digits and start with 07");
                }
            }
            return true;
        }),
        body("dob").optional().isDate().withMessage("Invalid date of birth format")
    ],
    async (req, res) => {
        const { id } = req.params;
        const { firstName, lastName, email, role, mobileno, dob } = req.body;

        try {
            // Update employee details
            await db.query(
                "UPDATE employees SET first_name = ?, last_name = ?, email = ?, role = ?, dob = ? WHERE employee_id = ?",
                [firstName, lastName, email, role, dob, id]
            );

            // Update mobile numbers
            await db.query("DELETE FROM employee_phones WHERE employee_id = ?", [id]);
            if (mobileno && mobileno.length > 0) {
                const phoneValues = mobileno.map(phone => [id, phone]);
                await db.query("INSERT INTO employee_phones (employee_id, phone_number) VALUES ?", [phoneValues]);
            }

            res.status(200).json({ message: "Employee updated successfully!" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);


// Delete Employee
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("DELETE FROM employees WHERE employee_id = ?", [id]);
        await db.query("DELETE FROM employee_phones WHERE employee_id = ?", [id]);
        res.status(200).json({ message: "Employee deleted successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
