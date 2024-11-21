const dotenv = require("dotenv");
dotenv.config();

const { Client } = require("@googlemaps/google-maps-services-js");
const client = new Client({});

const apiKey = process.env.GOOGLE_API_KEY;

const getLatLng = async (address) => {
  try {
    const response = await client.geocode({
      params: {
        address: address,
        key: apiKey,
      },
timeout: 5000
    });

    if (response.data.results.length > 0) {
      const { lat, lng } = response.data.results[0].geometry.location;
      return { lat, lng };
    } else {
      throw new Error("No results found for the given address.");
    }
  } catch (error) {
    console.error("Error fetching latitude and longitude:", error.message);
    throw error;
  }
};

module.exports = getLatLng;
