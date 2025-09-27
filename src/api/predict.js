// Mock prediction API
export const getPrediction = (deviceId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate realistic trend data
      const generateTrend = () => {
        const trend = [];
        let currentValue = 0.1;
        for (let i = 0; i < 7; i++) {
          trend.push(Math.round(currentValue * 100) / 100);
          currentValue += (Math.random() - 0.3) * 0.15;
          currentValue = Math.max(0, Math.min(1, currentValue));
        }
        return trend;
      };

      const riskLevels = ['Low', 'Moderate', 'High'];
      const randomRisk = riskLevels[Math.floor(Math.random() * riskLevels.length)];
      
      const rulDays = Math.floor(Math.random() * 60) + 5; // 5-65 days
      const confidence = Math.round((0.6 + Math.random() * 0.35) * 100) / 100;

      resolve({
        rul_days: rulDays,
        future_risk: randomRisk,
        confidence: confidence,
        trend: generateTrend(),
        timestamp: new Date().toISOString(),
        predictions: {
          next_week: Math.round((0.1 + Math.random() * 0.3) * 100) / 100,
          next_month: Math.round((0.2 + Math.random() * 0.4) * 100) / 100,
          next_quarter: Math.round((0.3 + Math.random() * 0.5) * 100) / 100
        }
      });
    }, 1000);
  });
};
