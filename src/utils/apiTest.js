import { config } from '../config/env';
import { STORAGE_KEYS } from '../constants';

export const testApiEndpoints = async () => {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const endpoints = [
    { name: 'Health Check', url: '/health', method: 'GET' },
    { name: 'Auth Profile', url: '/auth/profile', method: 'GET', requiresAuth: true },
    { name: 'Attendance Records', url: '/attendance/my-records', method: 'GET', requiresAuth: true },
    { name: 'Daily Summary', url: '/attendance/summary/daily', method: 'GET', requiresAuth: true },
    { name: 'Daily Summary (with date)', url: `/attendance/summary/daily?date=${currentDate.toISOString().split('T')[0]}`, method: 'GET', requiresAuth: true },
    { name: 'Monthly Stats', url: `/attendance/stats/monthly?year=${currentYear}&month=${currentMonth}`, method: 'GET', requiresAuth: true },
    { name: 'Monthly Stats (current)', url: '/attendance/stats/monthly', method: 'GET', requiresAuth: true },
  ];

  const results = [];

  console.log('🧪 Testing API endpoints...');
  console.log(`📅 Using date: ${currentDate.toISOString().split('T')[0]}`);
  console.log(`📅 Using year/month: ${currentYear}/${currentMonth}`);

  for (const endpoint of endpoints) {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      if (endpoint.requiresAuth && token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${config.API_BASE_URL}${endpoint.url}`, {
        method: endpoint.method,
        headers,
      });

      let responseData = null;
      try {
        responseData = await response.json();
      } catch (e) {
        // Response might not be JSON
      }

      const result = {
        ...endpoint,
        status: response.status,
        success: response.ok,
        error: response.ok ? null : `HTTP ${response.status}`,
        data: responseData,
        timestamp: new Date().toISOString(),
      };

      results.push(result);

      console.log(`${response.ok ? '✅' : '❌'} ${endpoint.name}: ${response.status}`);
      if (!response.ok && responseData) {
        console.log(`   Error details:`, responseData);
      }

    } catch (error) {
      const result = {
        ...endpoint,
        status: 0,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };

      results.push(result);
      console.log(`❌ ${endpoint.name}: ${error.message}`);
    }
  }

  console.log('🧪 API Test Results Summary:');
  const summary = {
    total: results.length,
    success: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    working_endpoints: results.filter(r => r.success).map(r => r.name),
    failing_endpoints: results.filter(r => !r.success).map(r => ({ name: r.name, error: r.error })),
  };

  console.log(summary);
  console.table(results);

  return { results, summary };
};

// Add to window for easy testing in console
if (typeof window !== 'undefined') {
  window.testApiEndpoints = testApiEndpoints;
}