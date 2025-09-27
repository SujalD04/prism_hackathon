import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton
} from '@mui/material';
import {
  Notifications,
  Warning,
  Error,
  Info,
  CheckCircle
} from '@mui/icons-material';

const NotificationItem = ({ notification, onClick }) => {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'health_alert':
        return <Error color="error" />;
      case 'maintenance_reminder':
        return <Warning color="warning" />;
      case 'performance_warning':
        return <Warning color="warning" />;
      case 'update_available':
        return <Info color="info" />;
      case 'battery_low':
        return <Warning color="warning" />;
      default:
        return <Notifications />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp) => {
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
        mb: 1,
        opacity: notification.read ? 0.7 : 1,
        transition: 'opacity 0.2s ease-in-out',
        '&:hover': {
          opacity: 1
        }
      }}
    >
      <ListItemButton onClick={() => onClick(notification)}>
        <ListItemIcon>
          {getNotificationIcon(notification.type)}
        </ListItemIcon>
        <ListItemText
          primary={
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1" component="span">
                {notification.title}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip
                  label={notification.priority}
                  color={getPriorityColor(notification.priority)}
                  size="small"
                  variant="outlined"
                />
                {!notification.read && (
                  <Chip
                    label="New"
                    color="primary"
                    size="small"
                    variant="filled"
                  />
                )}
              </Box>
            </Box>
          }
          secondary={
            <Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                {notification.message}
              </Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  {notification.deviceName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatTimestamp(notification.timestamp)}
                </Typography>
              </Box>
            </Box>
          }
        />
      </ListItemButton>
    </Card>
  );
};

export default NotificationItem;
