// Mock device data
const mockDevices = [
  {
    id: '1',
    name: 'Galaxy S22',
    type: 'Phone',
    healthStatus: 'Healthy',
    lastChecked: '2024-01-15T10:30:00Z',
    model: 'SM-S901B',
    serialNumber: 'RZ8R90XXXXX'
  },
  {
    id: '2',
    name: 'Galaxy Watch 4',
    type: 'Wearable',
    healthStatus: 'At-Risk',
    lastChecked: '2024-01-15T09:15:00Z',
    model: 'SM-R870',
    serialNumber: 'RZ8R91XXXXX'
  },
  {
    id: '3',
    name: 'Smart Washer WW7000T',
    type: 'Home Appliance',
    healthStatus: 'Unhealthy',
    lastChecked: '2024-01-15T08:45:00Z',
    model: 'WW7000T',
    serialNumber: 'RZ8R92XXXXX'
  },
  {
    id: '4',
    name: 'Galaxy Buds Pro',
    type: 'Audio',
    healthStatus: 'Healthy',
    lastChecked: '2024-01-15T11:20:00Z',
    model: 'SM-R190',
    serialNumber: 'RZ8R93XXXXX'
  },
  {
    id: '5',
    name: 'Smart TV QN90A',
    type: 'TV',
    healthStatus: 'At-Risk',
    lastChecked: '2024-01-15T07:30:00Z',
    model: 'QN55QN90AAFXZA',
    serialNumber: 'RZ8R94XXXXX'
  }
];

export const getDevices = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockDevices);
    }, 800);
  });
};

export const getDeviceById = (deviceId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const device = mockDevices.find(d => d.id === deviceId);
      if (device) {
        resolve(device);
      } else {
        reject(new Error('Device not found'));
      }
    }, 500);
  });
};
