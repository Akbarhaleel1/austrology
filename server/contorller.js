
const axios = require('axios');
const qs = require('qs');

const CLIENT_ID = 'e46601cf-ef60-4514-8862-63acd2acc02a';
const CLIENT_SECRET = 'rHe6z8t1i9tDSvMB8ZsJso816yj2QZwyRAJu5tqj';
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
