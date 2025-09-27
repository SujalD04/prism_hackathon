import React, { useState, useEffect } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Badge,
  Divider,
  useMediaQuery,
  useTheme,
  IconButton,
  Toolbar
} from '@mui/material';
import {
  Devices,
  Notifications,
  Settings,
  Dashboard,
  Menu as MenuIcon,
  ChevronLeft,
  ChevronRight
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUnreadCount } from '../api/notifications';

const Navigation = ({ onCollapseChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/devices'
    },
    {
      text: 'Devices',
      icon: <Devices />,
      path: '/devices'
    },
    {
      text: 'Notifications',
      icon: <Notifications />,
      path: '/notifications',
      badge: unreadCount
    },
    {
      text: 'Settings',
      icon: <Settings />,
      path: '/settings'
    }
  ];

  const fetchUnreadCount = async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    // Refresh unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      const newCollapsed = !collapsed;
      setCollapsed(newCollapsed);
      onCollapseChange?.(newCollapsed);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box sx={{ width: collapsed ? 64 : 250, height: '100%', transition: 'width 0.3s ease' }}>
      <Box
        sx={{
          p: collapsed ? 2 : 3,
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {!collapsed && (
          <Box>
            <Typography variant="h5" component="div" fontWeight="bold">
              Samsung Care+
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              AI Device Monitoring
            </Typography>
          </Box>
        )}
        <IconButton
          onClick={handleDrawerToggle}
          sx={{ color: 'primary.contrastText' }}
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </Box>
      
      <Divider />
      
      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path || 
                       (item.path === '/devices' && location.pathname === '/')}
              sx={{
                mx: 1,
                borderRadius: 2,
                minHeight: 48,
                justifyContent: collapsed ? 'center' : 'flex-start',
                px: collapsed ? 1 : 2,
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: collapsed ? 'auto' : 40, justifyContent: 'center' }}>
                {item.badge > 0 ? (
                  <Badge badgeContent={item.badge} color="error">
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              {!collapsed && (
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: location.pathname === item.path || 
                              (item.path === '/devices' && location.pathname === '/') ? 600 : 400
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      {isMobile && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: theme.zIndex.appBar,
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box display="flex" alignItems="center">
            <MenuIcon 
              sx={{ mr: 2, cursor: 'pointer' }}
              onClick={handleDrawerToggle}
            />
            <Typography variant="h6">Samsung Care+</Typography>
          </Box>
        </Box>
      )}
      
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: collapsed ? 64 : 250,
            borderRight: 'none',
            boxShadow: isMobile ? 3 : 1,
            transition: 'width 0.3s ease',
            overflowX: 'hidden',
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navigation;
