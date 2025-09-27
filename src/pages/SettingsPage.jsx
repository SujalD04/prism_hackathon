import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Notifications,
  AutoFixHigh,
  Person,
  Security,
  Language,
  DarkMode,
  VolumeUp
} from '@mui/icons-material';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    autoHealthChecks: true,
    pushNotifications: true,
    emailAlerts: false,
    maintenanceReminders: true,
    performanceWarnings: true,
    darkMode: false,
    language: 'en',
    soundAlerts: true
  });

  const [saveStatus, setSaveStatus] = useState(null);

  const handleSettingChange = (setting) => (event) => {
    setSettings(prev => ({
      ...prev,
      [setting]: event.target.checked
    }));
  };

  const handleSave = () => {
    // Simulate saving settings
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 2000);
    }, 1000);
  };

  const settingItems = [
    {
      key: 'notifications',
      label: 'Enable Notifications',
      description: 'Receive alerts about device health issues',
      icon: <Notifications />,
      type: 'switch'
    },
    {
      key: 'autoHealthChecks',
      label: 'Auto Health Checks',
      description: 'Automatically check device health periodically',
      icon: <AutoFixHigh />,
      type: 'switch'
    },
    {
      key: 'pushNotifications',
      label: 'Push Notifications',
      description: 'Receive push notifications on your device',
      icon: <VolumeUp />,
      type: 'switch'
    },
    {
      key: 'emailAlerts',
      label: 'Email Alerts',
      description: 'Send important alerts via email',
      icon: <Notifications />,
      type: 'switch'
    },
    {
      key: 'maintenanceReminders',
      label: 'Maintenance Reminders',
      description: 'Get reminded about scheduled maintenance',
      icon: <AutoFixHigh />,
      type: 'switch'
    },
    {
      key: 'performanceWarnings',
      label: 'Performance Warnings',
      description: 'Alert when device performance degrades',
      icon: <Security />,
      type: 'switch'
    },
    {
      key: 'soundAlerts',
      label: 'Sound Alerts',
      description: 'Play sound for important notifications',
      icon: <VolumeUp />,
      type: 'switch'
    }
  ];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Customize your Samsung Care+ AI experience
      </Typography>

      {saveStatus === 'saved' && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings saved successfully!
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Notification Preferences
          </Typography>
          <List>
            {settingItems.slice(0, 4).map((item) => (
              <ListItem key={item.key}>
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  secondary={item.description}
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings[item.key]}
                    onChange={handleSettingChange(item.key)}
                    color="primary"
                  />
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Device Monitoring
          </Typography>
          <List>
            {settingItems.slice(4, 6).map((item) => (
              <ListItem key={item.key}>
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  secondary={item.description}
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings[item.key]}
                    onChange={handleSettingChange(item.key)}
                    color="primary"
                  />
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Appearance & Audio
          </Typography>
          <List>
            {settingItems.slice(6).map((item) => (
              <ListItem key={item.key}>
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  secondary={item.description}
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings[item.key]}
                    onChange={handleSettingChange(item.key)}
                    color="primary"
                  />
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Account & Privacy
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <Person />
              </ListItemIcon>
              <ListItemText
                primary="Profile Information"
                secondary="Manage your personal details and preferences"
              />
              <ListItemSecondaryAction>
                <Button variant="outlined" size="small">
                  Edit
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemIcon>
                <Security />
              </ListItemIcon>
              <ListItemText
                primary="Privacy Settings"
                secondary="Control how your data is used and shared"
              />
              <ListItemSecondaryAction>
                <Button variant="outlined" size="small">
                  Manage
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </CardContent>
      </Card>

      <Box display="flex" justifyContent="flex-end" gap={2}>
        <Button
          variant="outlined"
          onClick={() => {
            // Reset to default settings
            setSettings({
              notifications: true,
              autoHealthChecks: true,
              pushNotifications: true,
              emailAlerts: false,
              maintenanceReminders: true,
              performanceWarnings: true,
              darkMode: false,
              language: 'en',
              soundAlerts: true
            });
          }}
        >
          Reset to Defaults
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
        >
          {saveStatus === 'saving' ? 'Saving...' : 'Save Settings'}
        </Button>
      </Box>
    </Container>
  );
};

export default SettingsPage;
