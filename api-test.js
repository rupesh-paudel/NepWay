// Quick API test
const testAPI = async () => {
  console.log('🧪 Testing API connection...');
  
  try {
    // Test 1: Basic server connection
    console.log('Test 1: Basic server connection');
    const response1 = await fetch('http://localhost:5000/');
    const text1 = await response1.text();
    console.log('✅ Basic connection:', text1);
    
    // Test 2: API test endpoint
    console.log('Test 2: Test endpoint');
    const response2 = await fetch('http://localhost:5000/test');
    const data2 = await response2.json();
    console.log('✅ Test endpoint:', data2);
    
    // Test 3: Users endpoint
    console.log('Test 3: Users endpoint (register test)');
    const registerResponse = await fetch('http://localhost:5000/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Frontend Test User',
        email: 'frontend@test.com',
        password: 'password123',
        role: 'driver'
      })
    });
    console.log('Register response status:', registerResponse.status);
    const registerData = await registerResponse.json();
    console.log('✅ Register response:', registerData);
    
    // Test 4: Login
    console.log('Test 4: Login');
    const loginResponse = await fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'frontend@test.com',
        password: 'password123'
      })
    });
    const loginData = await loginResponse.json();
    console.log('✅ Login response:', loginData);
    
    if (loginData.token) {
      // Test 5: Get rides
      console.log('Test 5: Get rides');
      const ridesResponse = await fetch('http://localhost:5000/api/rides');
      console.log('Get rides status:', ridesResponse.status);
      if (ridesResponse.ok) {
        const ridesData = await ridesResponse.json();
        console.log('✅ Get rides:', ridesData);
      } else {
        const errorText = await ridesResponse.text();
        console.log('❌ Get rides error:', errorText);
      }
      
      // Test 6: Create ride
      console.log('Test 6: Create ride');
      const createRideResponse = await fetch('http://localhost:5000/api/rides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginData.token}`
        },
        body: JSON.stringify({
          from: 'Test From',
          to: 'Test To',
          date: '2025-07-15',
          time: '10:00',
          availableSeats: 3,
          pricePerSeat: 25
        })
      });
      console.log('Create ride status:', createRideResponse.status);
      if (createRideResponse.ok) {
        const createRideData = await createRideResponse.json();
        console.log('✅ Create ride:', createRideData);
      } else {
        const errorText = await createRideResponse.text();
        console.log('❌ Create ride error:', errorText);
      }
    }
    
  } catch (error) {
    console.error('❌ API Test failed:', error);
  }
};

testAPI();
