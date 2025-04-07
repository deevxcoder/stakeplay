import fetch from 'node-fetch';

async function testMakeAdmin() {
  try {
    const response = await fetch('http://localhost:5000/api/make-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',  // Explicitly request JSON response
      },
      body: JSON.stringify({ username: 'admin' }),
    });
    
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    
    try {
      const text = await response.text();
      console.log('Response text:', text);
      
      // Try to parse JSON if possible
      try {
        const data = JSON.parse(text);
        console.log('Parsed JSON:', data);
      } catch (jsonError) {
        console.log('Not valid JSON response');
      }
    } catch (textError) {
      console.error('Error getting response text:', textError);
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

testMakeAdmin();