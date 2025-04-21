
const axios = require('axios');
const qs = require('qs');

const CLIENT_ID = '2a093bb1-670c-4cd7-a369-df017e559c12';
const CLIENT_SECRET = 'lfYv2bqAbLkzkZrqFk8VIFoseHe5Dkfgyay4p9O0';
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
