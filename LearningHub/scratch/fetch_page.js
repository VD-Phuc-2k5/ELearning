const axios = require('axios');

async function main() {
  try {
    const url =
      'http://localhost:3002/problems/835776e5-58b9-47a5-bce4-7cedc0ae4c82';
    console.log(`Fetching page: ${url}`);
    const res = await axios.get(url, {
      validateStatus: () => true, // Don't throw on 404/500
    });
    console.log(`Status Code: ${res.status}`);
    console.log(`Headers:`, res.headers);
    console.log(`HTML preview (first 500 chars):`);
    console.log(res.data.substring(0, 500));
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

main();
