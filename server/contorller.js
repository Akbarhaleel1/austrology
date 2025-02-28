
const axios = require('axios');
const qs = require('qs');

const CLIENT_ID = 'e01da02f-da4c-4b3f-869b-21d1321419b4';
const CLIENT_SECRET = 'oDmhNQfH9vuqmoaNgA9m9j26HKTzEwG1pXnzJ7iN';
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
