import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Grid,
  Chip,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp,
  Warning,
  CheckCircle,
  Error
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getPrediction } from '../api/predict';

const ForecastSection = ({ deviceId, deviceName }) => {
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPredictionData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPrediction(deviceId);
      setPredictionData(data);
    } catch (err) {
      setError('Failed to fetch prediction data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictionData();
  }, [deviceId]);

  const getRiskIcon = (risk) => {
    switch (risk) {
      case 'Low':
        return <CheckCircle color="success" />;
      case 'Moderate':
        return <Warning color="warning" />;
      case 'High':
        return <Error color="error" />;
      default:
        return <CheckCircle />;
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low':
        return 'success';
      case 'Moderate':
        return 'warning';
      case 'High':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatChartData = (trend) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return trend.map((value, index) => ({
      day: days[index],
      healthScore: value * 100
    }));
  };

  if (loading && !predictionData) {
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
          <Alert severity="error">
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Future Risk Forecast
        </Typography>

        {predictionData && (
          <>
            <Grid container spacing={3} mb={3}>
              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="h4" component="div" color="primary">
                    {predictionData.rul_days}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Days Remaining
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Useful Life
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    textAlign: 'center'
                  }}
                >
                  <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                    {getRiskIcon(predictionData.future_risk)}
                    <Typography variant="h6" component="span" sx={{ ml: 1 }}>
                      {predictionData.future_risk}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Future Risk Level
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="h4" component="div" color="primary">
                    {Math.round(predictionData.confidence * 100)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Confidence Score
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                Health Score Trend (Last 7 Days)
              </Typography>
              <Box height={200}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formatChartData(predictionData.trend)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Health Score']}
                      labelFormatter={(label) => `Day: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="healthScore" 
                      stroke="#1976d2" 
                      strokeWidth={2}
                      dot={{ fill: '#1976d2', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Box>

            <Box mb={2}>
              <Typography variant="h6" gutterBottom>
                Risk Predictions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Next Week
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={predictionData.predictions.next_week * 100}
                      color={predictionData.predictions.next_week > 0.5 ? 'warning' : 'success'}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {Math.round(predictionData.predictions.next_week * 100)}% risk
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Next Month
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={predictionData.predictions.next_month * 100}
                      color={predictionData.predictions.next_month > 0.5 ? 'warning' : 'success'}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {Math.round(predictionData.predictions.next_month * 100)}% risk
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Next Quarter
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={predictionData.predictions.next_quarter * 100}
                      color={predictionData.predictions.next_quarter > 0.5 ? 'warning' : 'success'}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {Math.round(predictionData.predictions.next_quarter * 100)}% risk
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Typography variant="caption" color="text.secondary" display="block" mt={2}>
              Last updated: {new Date(predictionData.timestamp).toLocaleString()}
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ForecastSection;
