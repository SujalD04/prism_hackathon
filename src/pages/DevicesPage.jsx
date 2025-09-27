import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Alert,
  Fab
} from '@mui/material';
import {
  Add,
  Refresh
} from '@mui/icons-material';
import DeviceCard from '../components/DeviceCard';
import { getDevices } from '../api/devices';
import { useNavigate } from 'react-router-dom';

const DevicesPage = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchDevices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDevices();
      setDevices(data);
    } catch (err) {
      setError('Failed to fetch devices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleDeviceClick = (deviceId) => {
    navigate(`/devices/${deviceId}`);
  };

  const getHealthStats = () => {
    const healthy = devices.filter(d => d.healthStatus === 'Healthy').length;
    const atRisk = devices.filter(d => d.healthStatus === 'At-Risk').length;
    const unhealthy = devices.filter(d => d.healthStatus === 'Unhealthy').length;
    return { healthy, atRisk, unhealthy };
  };

  const stats = getHealthStats();

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" action={
          <Fab color="primary" size="small" onClick={fetchDevices}>
            <Refresh />
          </Fab>
        }>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Devices
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Monitor the health and performance of all your Samsung devices
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Box
              sx={{
                p: 2,
                border: 1,
                borderColor: 'success.main',
                borderRadius: 1,
                textAlign: 'center',
                backgroundColor: 'success.light',
                color: 'success.contrastText'
              }}
            >
              <Typography variant="h4">{stats.healthy}</Typography>
              <Typography variant="body2">Healthy</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box
              sx={{
                p: 2,
                border: 1,
                borderColor: 'warning.main',
                borderRadius: 1,
                textAlign: 'center',
                backgroundColor: 'warning.light',
                color: 'warning.contrastText'
              }}
            >
              <Typography variant="h4">{stats.atRisk}</Typography>
              <Typography variant="body2">At Risk</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box
              sx={{
                p: 2,
                border: 1,
                borderColor: 'error.main',
                borderRadius: 1,
                textAlign: 'center',
                backgroundColor: 'error.light',
                color: 'error.contrastText'
              }}
            >
              <Typography variant="h4">{stats.unhealthy}</Typography>
              <Typography variant="body2">Unhealthy</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3}>
        {devices.map((device) => (
          <Grid item xs={12} sm={6} md={4} key={device.id}>
            <DeviceCard
              device={device}
              onClick={handleDeviceClick}
            />
          </Grid>
        ))}
      </Grid>

      {devices.length === 0 && (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No devices found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add your Samsung devices to start monitoring their health
          </Typography>
        </Box>
      )}

      <Fab
        color="primary"
        aria-label="add device"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={() => {
          // Placeholder for add device functionality
          alert('Add device functionality will be implemented later');
        }}
      >
        <Add />
      </Fab>
    </Container>
  );
};

export default DevicesPage;
