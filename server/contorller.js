
const axios = require('axios');
const qs = require('qs');

const CLIENT_ID = '03c4b317-3cf2-415b-b144-9115a7dc1878';
const CLIENT_SECRET = '3buFiWztBO9KXWMUrXKUTjhJU4N2sBpmO5W3Vbe4';
const TOKEN_URL = 'https://api.prokerala.com/token';

async function getAccessToken() {
    try {
        const response = await axios.post(
            TOKEN_URL,
            qs.stringify({
                grant_type: 'client_credentials',
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        console.log('Access Token:', response.data);
        return response.data.access_token;
    } catch (error) {
        console.error('Error fetching access token:', error.response ? error.response.data : error.message);
    }
}

// Export the function
module.exports = { getAccessToken };
