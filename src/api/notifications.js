// Mock notifications data
const mockNotifications = [
  {
    id: '1',
    deviceId: '3',
    deviceName: 'Smart Washer WW7000T',
    type: 'health_alert',
    title: 'Device Health Alert',
    message: 'Your Smart Washer has become Unhealthy. Please schedule maintenance.',
    timestamp: '2024-01-15T08:45:00Z',
    read: false,
    priority: 'high'
  },
  {
    id: '2',
    deviceId: '2',
    deviceName: 'Galaxy Watch 4',
    type: 'maintenance_reminder',
    title: 'Maintenance Reminder',
    message: 'Fan motor may need maintenance soon. Consider scheduling a check-up.',
    timestamp: '2024-01-14T15:30:00Z',
    read: false,
    priority: 'medium'
  },
  {
    id: '3',
    deviceId: '5',
    deviceName: 'Smart TV QN90A',
    type: 'performance_warning',
    title: 'Performance Warning',
    message: 'Your Smart TV is showing signs of reduced performance. Consider optimization.',
    timestamp: '2024-01-13T20:15:00Z',
    read: true,
    priority: 'low'
  },
  {
    id: '4',
    deviceId: '1',
    deviceName: 'Galaxy S22',
    type: 'update_available',
    title: 'Software Update Available',
    message: 'A new software update is available for your Galaxy S22. Update recommended.',
    timestamp: '2024-01-12T10:00:00Z',
    read: true,
    priority: 'medium'
  },
  {
    id: '5',
    deviceId: '4',
    deviceName: 'Galaxy Buds Pro',
    type: 'battery_low',
    title: 'Battery Low',
    message: 'Your Galaxy Buds Pro battery is running low. Please charge soon.',
    timestamp: '2024-01-11T18:45:00Z',
    read: true,
    priority: 'low'
  }
];

export const getNotifications = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    }, 600);
  });
};

export const markNotificationAsRead = (notificationId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const notification = mockNotifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
      }
      resolve(notification);
    }, 300);
  });
};

export const getUnreadCount = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const unreadCount = mockNotifications.filter(n => !n.read).length;
      resolve(unreadCount);
    }, 200);
  });
};
