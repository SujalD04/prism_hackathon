// Mock classification API
export const classifyDevice = (deviceId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate different health statuses based on device ID
      const healthStatuses = ['Healthy', 'Unhealthy', 'Warning'];
      const randomStatus = healthStatuses[Math.floor(Math.random() * healthStatuses.length)];
      
      const baseMetrics = {
        temp: Math.round((35 + Math.random() * 10) * 10) / 10,
        battery: Math.round(Math.random() * 100),
        voltage: Math.round((3.0 + Math.random() * 1.5) * 10) / 10,
        memory: Math.round(Math.random() * 100)
      };

      // Adjust metrics based on health status
      if (randomStatus === 'Unhealthy') {
        baseMetrics.temp += 5;
        baseMetrics.battery = Math.max(0, baseMetrics.battery - 20);
        baseMetrics.voltage = Math.max(2.5, baseMetrics.voltage - 0.3);
        baseMetrics.memory = Math.min(100, baseMetrics.memory + 20);
      } else if (randomStatus === 'Warning') {
        baseMetrics.temp += 2;
        baseMetrics.battery = Math.max(0, baseMetrics.battery - 10);
        baseMetrics.voltage = Math.max(2.8, baseMetrics.voltage - 0.1);
        baseMetrics.memory = Math.min(100, baseMetrics.memory + 10);
      }

      resolve({
        status: randomStatus,
        confidence: Math.round((0.7 + Math.random() * 0.25) * 100) / 100,
        metrics: baseMetrics,
        timestamp: new Date().toISOString(),
        recommendations: randomStatus === 'Unhealthy' ? 
          ['Schedule maintenance', 'Check for software updates', 'Contact support'] :
          randomStatus === 'Warning' ?
          ['Monitor closely', 'Consider preventive maintenance'] :
          ['Continue regular monitoring']
      });
    }, 1500);
  });
};
