# Samsung Care+ AI Frontend

A React-based web frontend for the Samsung Care+ AI system that allows users to monitor device health, view predictions, and manage notifications.

## Features

### 📱 Device Management
- View all linked Samsung devices
- Real-time health status monitoring
- Device-specific health metrics (temperature, battery, voltage, memory)
- Health status badges (Healthy, At-Risk, Unhealthy)

### 🔮 AI Predictions
- Future risk forecasting
- Remaining Useful Life (RUL) predictions
- Health score trend visualization
- Risk level assessments (Low, Moderate, High)

### 🔔 Notifications
- Real-time alerts for device issues
- Maintenance reminders
- Performance warnings
- Notification filtering and management

### ⚙️ Settings
- Notification preferences
- Auto-health check controls
- Appearance and audio settings
- Account and privacy management

## Pages & Routes

- `/devices` - Main dashboard showing all devices
- `/devices/:deviceId` - Detailed device view with health status and predictions
- `/notifications` - Notification center with filtering
- `/settings` - User preferences and configuration

## Technology Stack

- **React 18** - Frontend framework
- **Material-UI (MUI)** - UI component library
- **React Router** - Client-side routing
- **Recharts** - Data visualization
- **Mock APIs** - Simulated backend services

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (one-way operation)

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── DeviceCard.jsx
│   ├── HealthStatusSection.jsx
│   ├── ForecastSection.jsx
│   ├── NotificationItem.jsx
│   └── Navigation.jsx
├── pages/              # Page components
│   ├── DevicesPage.jsx
│   ├── DeviceDetailPage.jsx
│   ├── NotificationsPage.jsx
│   └── SettingsPage.jsx
├── api/                # Mock API services
│   ├── devices.js
│   ├── classify.js
│   ├── predict.js
│   └── notifications.js
├── App.jsx             # Main app component
└── index.js            # App entry point
```

## API Integration

The frontend currently uses mock APIs that simulate real backend responses. These are located in the `/src/api/` directory:

- `devices.js` - Device management endpoints
- `classify.js` - Health classification model simulation
- `predict.js` - Risk prediction model simulation
- `notifications.js` - Notification management

### Replacing Mock APIs

When your backend team is ready to integrate:

1. Replace the mock API functions in `/src/api/` with real HTTP calls
2. Update the response data structures to match your backend API
3. Add proper error handling and loading states
4. Configure API base URLs and authentication

## Features in Detail

### Device Health Monitoring
- Real-time health classification using AI models
- Key metrics visualization (temperature, battery, voltage, memory)
- Health status indicators with confidence scores
- Refresh functionality for updated health checks

### Risk Prediction
- 7-day health score trend visualization
- Remaining Useful Life (RUL) predictions
- Future risk level assessments
- Confidence scoring for predictions

### Responsive Design
- Mobile-first approach
- Collapsible navigation on mobile devices
- Touch-friendly interface elements
- Optimized for various screen sizes

## Customization

### Theming
The app uses Material-UI theming. You can customize colors, typography, and component styles in `src/App.jsx`.

### Adding New Device Types
1. Update the device icon mapping in `DeviceCard.jsx`
2. Add new device types to the mock data in `devices.js`
3. Update the health metrics logic if needed

### Extending Notifications
1. Add new notification types in `notifications.js`
2. Update the notification icon mapping in `NotificationItem.jsx`
3. Add filtering options in `NotificationsPage.jsx`

## Future Enhancements

- Real-time WebSocket connections for live updates
- Advanced filtering and search capabilities
- Export functionality for reports
- Multi-language support
- Dark mode toggle
- Advanced analytics dashboard

## Contributing

1. Follow the existing code structure and naming conventions
2. Use Material-UI components for consistency
3. Add proper error handling and loading states
4. Test on both desktop and mobile devices
5. Update documentation for new features

## License

This project is part of the Samsung Care+ AI system.
