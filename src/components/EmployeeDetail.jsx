import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box } from '@mui/material';

const EmployeeDetail = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/employees/${id}`);
        setEmployee(response.data);
      } catch (error) {
        console.error('Error fetching employee:', error);
      }
    };

    fetchEmployee();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // Ensure employee data includes phone numbers and other details
      const updatedEmployee = {
        ...employee,
        phone_number: employee.phone_number // Send as array
      };

      await axios.put(`http://localhost:5000/api/employees/${id}`, updatedEmployee);
      setMessage('Employee updated successfully');
      navigate('/employees');
    } catch (error) {
      setMessage('Error updating employee');
      console.error('Error updating employee:', error);
      if (error.response) {
        // Log server error response
        console.error("Server Response:", error.response.data);
        setMessage(error.response.data.errors.map(e => e.msg).join(', ')); // Show error messages
      }
    }
  };

  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setEmployee({ ...employee, [name]: value });
  // };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone_number") {
      setEmployee((prev) => ({
        ...prev,
        phone_number: value.split(",").map((num) => num.trim()), // Convert to array
      }));
    } else {
      setEmployee((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };


  if (!employee) return <div>Loading...</div>;

  return (
      <Container maxWidth="sm">
        <Typography variant="h4" gutterBottom>
          Update Employee
        </Typography>
        <Box component="form" onSubmit={handleUpdate}>
          <TextField
              label="First Name"
              name="first_name"
              value={employee.first_name}
              onChange={handleChange}
              fullWidth
              margin="normal"
          />
          <TextField
              label="Last Name"
              name="last_name"
              value={employee.last_name}
              onChange={handleChange}
              fullWidth
              margin="normal"
          />
          <TextField
              label="NIC"
              name="nic"
              value={employee.nic}
              onChange={handleChange}
              fullWidth
              margin="normal"
          />
          <TextField
              label="Role"
              name="role"
              value={employee.role}
              onChange={handleChange}
              fullWidth
              margin="normal"
          />
          <TextField
              label="Date Of Birth"
              name="dob"
              value={employee.dob}
              onChange={handleChange}
              fullWidth
              margin="normal"
          />
          <TextField
              label="Email"
              name="email"
              value={employee.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
          />
          <TextField
              label="Telephone Numbers"
              name="phone_number"
              value={employee.phone_number ? employee.phone_number.join(", ") : ""}
              onChange={handleChange}
              fullWidth
              margin="normal"
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Update
          </Button>
        </Box>
        {message && <Typography color="error">{message}</Typography>}
      </Container>
  );
};

export default EmployeeDetail;
