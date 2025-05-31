const axios = require('axios');
const logger = require('../config/logger');

const query = async (text) => {
  try {
    const response = await axios.post(
      'https://google.serper.dev/search',
      {
        q: text
      },
      {
        headers: {
          'X-API-KEY': process.env.SERPER_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.organic?.slice(0, 5) || [];

  } catch (error) {
    logger.error(`Search failed: ${error.message}`);
    throw new Error("Fact-gathering service unavailable");
  }
};

module.exports = { query };
