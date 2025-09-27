import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  Tabs,
  Tab,
  Badge,
  Chip
} from '@mui/material';
import {
  Refresh,
  DoneAll
} from '@mui/icons-material';
import NotificationItem from '../components/NotificationItem';
import { getNotifications, markNotificationAsRead, getUnreadCount } from '../api/notifications';
import { useNavigate } from 'react-router-dom';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNotifications();
      setNotifications(data);
      const unread = await getUnreadCount();
      setUnreadCount(unread);
    } catch (err) {
      setError('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    navigate(`/devices/${notification.deviceId}`);
  };

  const handleMarkAllRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    for (const notification of unreadNotifications) {
      await markNotificationAsRead(notification.id);
    }
    setUnreadCount(0);
    fetchNotifications(); // Refresh to update read status
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const getFilteredCount = (filterType) => {
    switch (filterType) {
      case 'unread':
        return notifications.filter(n => !n.read).length;
      case 'read':
        return notifications.filter(n => n.read).length;
      default:
        return notifications.length;
    }
  };

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
          <Button color="inherit" size="small" onClick={fetchNotifications}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" component="h1">
            Notifications
          </Typography>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<DoneAll />}
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
            >
              Mark All Read
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchNotifications}
            >
              Refresh
            </Button>
          </Box>
        </Box>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Stay informed about your device health and maintenance needs
        </Typography>

        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Chip
            label={`${unreadCount} unread`}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`${notifications.length} total`}
            color="default"
            variant="outlined"
          />
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={filter} onChange={(e, newValue) => setFilter(newValue)}>
          <Tab 
            label={
              <Badge badgeContent={getFilteredCount('unread')} color="primary">
                All
              </Badge>
            } 
            value="all" 
          />
          <Tab 
            label={
              <Badge badgeContent={getFilteredCount('unread')} color="primary">
                Unread
              </Badge>
            } 
            value="unread" 
          />
          <Tab 
            label={
              <Badge badgeContent={getFilteredCount('read')} color="default">
                Read
              </Badge>
            } 
            value="read" 
          />
        </Tabs>
      </Box>

      {filteredNotifications.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {filter === 'unread' ? 'No unread notifications' :
             filter === 'read' ? 'No read notifications' :
             'No notifications found'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filter === 'all' ? 'You\'ll see device alerts and updates here' :
             'All caught up!'}
          </Typography>
        </Box>
      ) : (
        <Box>
          {filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={handleNotificationClick}
            />
          ))}
        </Box>
      )}
    </Container>
  );
};

export default NotificationsPage;
