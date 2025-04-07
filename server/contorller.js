
const axios = require('axios');
const qs = require('qs');

const CLIENT_ID = '16b887c7-a5b4-48fa-ab79-d42a378c378a';
const CLIENT_SECRET = 're3KF4HWC1vhczrDIHJhO8eIL0tOTWJohalNgEoZ';
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
