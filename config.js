const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    SPOONACULAR_API_KEY: process.env.Spoonacular_API_KEY,
    EDAMAM_API_KEY: process.env.Edamam_API_KEY,
    EDAMAM_APP_ID: process.env.Edamam_API_ID,
    UNSPLASH_API_KEY: process.env.unsplash_CLIENT_ID,
};
