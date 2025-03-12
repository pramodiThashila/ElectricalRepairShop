import React from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, Button, Avatar } from '@mui/material';
import Sidebar from './Sidebar';
import { BarChart } from '@mui/x-charts';

const Dashboard = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Container>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2">
                  Employee Performance Ratings
                </Typography>
                <BarChart data={[/* your data here */]} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2">
                  Income Statistics
                </Typography>
                <BarChart data={[/* your data here */]} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;