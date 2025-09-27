import React from 'react';
import {
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Chip,
  Box,
  Grid
} from '@mui/material';
import {
  PhoneAndroid,
  Watch,
  LocalLaundryService,
  Headphones,
  Tv
} from '@mui/icons-material';

const DeviceCard = ({ device, onClick }) => {
  const getDeviceIcon = (type) => {
    switch (type) {
      case 'Phone':
        return <PhoneAndroid />;
      case 'Wearable':
        return <Watch />;
      case 'Home Appliance':
        return <LocalLaundryService />;
      case 'Audio':
        return <Headphones />;
      case 'TV':
        return <Tv />;
      default:
        return <PhoneAndroid />;
    }
  };

  const getHealthStatusColor = (status) => {
    switch (status) {
      case 'Healthy':
        return 'success';
      case 'At-Risk':
        return 'warning';
      case 'Unhealthy':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatLastChecked = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
    >
      <CardActionArea onClick={() => onClick(device.id)} sx={{ height: '100%' }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={2}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText'
                }}
              >
                {getDeviceIcon(device.type)}
              </Box>
            </Grid>
            <Grid item xs={10}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="h6" component="h2" noWrap>
                  {device.name}
                </Typography>
                <Chip
                  label={device.healthStatus}
                  color={getHealthStatusColor(device.healthStatus)}
                  size="small"
                  variant="outlined"
                />
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {device.type} • {device.model}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Last checked: {formatLastChecked(device.lastChecked)}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default DeviceCard;
