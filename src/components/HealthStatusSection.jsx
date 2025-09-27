import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  CircularProgress,
  Grid,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Refresh,
  CheckCircle,
  Warning,
  Error,
  Thermostat,
  BatteryFull,
  Memory,
  FlashOn
} from '@mui/icons-material';
import { classifyDevice } from '../api/classify';

const HealthStatusSection = ({ deviceId, deviceName }) => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHealthData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await classifyDevice(deviceId);
      setHealthData(data);
    } catch (err) {
      setError('Failed to fetch health data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, [deviceId]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Healthy':
        return <CheckCircle color="success" />;
      case 'Warning':
        return <Warning color="warning" />;
      case 'Unhealthy':
        return <Error color="error" />;
      default:
        return <CheckCircle />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Healthy':
        return 'success';
      case 'Warning':
        return 'warning';
      case 'Unhealthy':
        return 'error';
      default:
        return 'default';
    }
  };

  const getMetricIcon = (metric) => {
    switch (metric) {
      case 'temp':
        return <Thermostat />;
      case 'battery':
        return <BatteryFull />;
      case 'memory':
        return <Memory />;
      case 'voltage':
        return <FlashOn />;
      default:
        return null;
    }
  };

  const getMetricColor = (metric, value) => {
    switch (metric) {
      case 'temp':
        return value > 40 ? 'error' : value > 35 ? 'warning' : 'success';
      case 'battery':
        return value < 20 ? 'error' : value < 50 ? 'warning' : 'success';
      case 'memory':
        return value > 80 ? 'error' : value > 60 ? 'warning' : 'success';
      case 'voltage':
        return value < 3.0 ? 'error' : value < 3.3 ? 'warning' : 'success';
      default:
        return 'default';
    }
  };

  if (loading && !healthData) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error" action={
            <Button color="inherit" size="small" onClick={fetchHealthData}>
              Retry
            </Button>
          }>
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" component="h2">
            Current Health Status
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchHealthData}
            disabled={loading}
          >
            {loading ? 'Checking...' : 'Refresh'}
          </Button>
        </Box>

        {healthData && (
          <>
            <Box display="flex" alignItems="center" mb={3}>
              {getStatusIcon(healthData.status)}
              <Box ml={2}>
                <Typography variant="h4" component="span">
                  {healthData.status}
                </Typography>
                <Chip
                  label={`${Math.round(healthData.confidence * 100)}% confidence`}
                  color={getStatusColor(healthData.status)}
                  size="small"
                  sx={{ ml: 2 }}
                />
              </Box>
            </Box>

            <Grid container spacing={3} mb={3}>
              {Object.entries(healthData.metrics).map(([metric, value]) => (
                <Grid item xs={6} sm={3} key={metric}>
                  <Box
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      textAlign: 'center'
                    }}
                  >
                    <Box color={`${getMetricColor(metric, value)}.main`} mb={1}>
                      {getMetricIcon(metric)}
                    </Box>
                    <Typography variant="h6" component="div">
                      {metric === 'temp' ? `${value}°C` :
                       metric === 'battery' ? `${value}%` :
                       metric === 'voltage' ? `${value}V` :
                       `${value}%`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" textTransform="capitalize">
                      {metric === 'temp' ? 'Temperature' :
                       metric === 'battery' ? 'Battery' :
                       metric === 'voltage' ? 'Voltage' :
                       'Memory Usage'}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            {healthData.recommendations && healthData.recommendations.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Recommendations
                </Typography>
                <List dense>
                  {healthData.recommendations.map((recommendation, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={recommendation} />
                    </ListItem>
                  ))}
                </List>
              </>
            )}

            <Typography variant="caption" color="text.secondary" display="block" mt={2}>
              Last updated: {new Date(healthData.timestamp).toLocaleString()}
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthStatusSection;
