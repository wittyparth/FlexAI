/**
 * Network Test Utility
 * 
 * Test API connectivity from React Native app
 */

import { API_BASE_URL } from '../api/client';
import axios from 'axios';

export const testApiConnection = async () => {
    const tests = [
        {
            name: 'Base URL Reachability',
            url: API_BASE_URL.replace('/api/v1', ''),
            method: 'GET',
        },
        {
            name: 'Health Endpoint',
            url: `${API_BASE_URL.replace('/api/v1', '')}/health`,
            method: 'GET',
        },
        {
            name: 'API v1 Base',
            url: API_BASE_URL,
            method: 'GET',
        },
    ];

    console.log('🧪 Starting Network Tests...\n');
    console.log('📍 Testing URL:', API_BASE_URL);
    console.log('━'.repeat(60));

    const results = [];

    for (const test of tests) {
        try {
            console.log(`\n🔍 Testing: ${test.name}`);
            console.log(`   URL: ${test.url}`);

            const startTime = Date.now();
            const response = await axios({
                method: test.method,
                url: test.url,
                timeout: 5000,
            });
            const duration = Date.now() - startTime;

            console.log(`   ✅ SUCCESS (${duration}ms)`);
            console.log(`   Status: ${response.status}`);
            results.push({ ...test, success: true, duration, status: response.status });
        } catch (error: any) {
            console.log(`   ❌ FAILED`);
            console.log(`   Error: ${error.message}`);
            if (error.code) {
                console.log(`   Code: ${error.code}`);
            }
            results.push({ ...test, success: false, error: error.message, code: error.code });
        }
    }

    console.log('\n' + '━'.repeat(60));
    console.log('📊 Test Summary:');
    console.log(`   Total: ${results.length}`);
    console.log(`   Passed: ${results.filter((r) => r.success).length}`);
    console.log(`   Failed: ${results.filter((r) => !r.success).length}`);

    const allPassed = results.every((r) => r.success);
    if (allPassed) {
        console.log('\n🎉 All tests passed! Backend is reachable.');
    } else {
        console.log('\n⚠️ Some tests failed. Check the details above.');
        console.log('\n💡 Troubleshooting:');
        console.log('   1. Is the backend running? (npm run dev)');
        console.log('   2. Check the IP address in client.ts');
        console.log('   3. Are you on the same WiFi network?');
        console.log('   4. Try pinging the IP:', API_BASE_URL.match(/http:\/\/([^:]+)/)?.[1]);
    }

    return results;
};

// Export for use in Profile screen or debug panel
export const getConnectionInfo = () => {
    return {
        baseUrl: API_BASE_URL,
        platform: require('react-native').Platform.OS,
        isDev: __DEV__,
    };
};
