import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  ArrowBack,
  Home
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import HealthStatusSection from '../components/HealthStatusSection';
import ForecastSection from '../components/ForecastSection';
import { getDeviceById } from '../api/devices';

const DeviceDetailPage = () => {
  const { deviceId } = useParams();
  const navigate = useNavigate();
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDevice = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDeviceById(deviceId);
      setDevice(data);
    } catch (err) {
      setError('Device not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevice();
  }, [deviceId]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !device) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={() => navigate('/devices')}>
            Back to Devices
          </Button>
        }>
          {error || 'Device not found'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link
            underline="hover"
            color="inherit"
            href="/devices"
            onClick={(e) => {
              e.preventDefault();
              navigate('/devices');
            }}
          >
            <Home sx={{ mr: 0.5 }} fontSize="inherit" />
            Devices
          </Link>
          <Typography color="text.primary">{device.name}</Typography>
        </Breadcrumbs>

        <Box display="flex" alignItems="center" mb={2}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/devices')}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Box>
            <Typography variant="h4" component="h1">
              {device.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {device.type} • {device.model} • {device.serialNumber}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" gap={3}>
        <HealthStatusSection deviceId={deviceId} deviceName={device.name} />
        <ForecastSection deviceId={deviceId} deviceName={device.name} />
      </Box>
    </Container>
  );
};

export default DeviceDetailPage;
