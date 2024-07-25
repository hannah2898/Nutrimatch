const unsplash = "https://api.unsplash.com/";
const unsplash_CLIENT_ID = process.env.UNSPLASH_CLIENT_ID;
const images = []; // Array to store images for each recipe

// Function to get images from Unsplash API by using the recipe title
async function getImages(recipe) {
    let query = recipe.title || recipe.recipe.label;    
    // Building the request URL with encoded query parameters
    let reqUrl = `${unsplash}/search/photos?client_id=${unsplash_CLIENT_ID}&query=${encodeURIComponent(query)}&orientation=portrait&page=1&per_page=5`;
    console.log("Request URL:", reqUrl);

    try {
        const response = await fetch(reqUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const foodTags = ['food', 'meal', 'cooking', 'recipe', 'restaurant', 'noodles', 'dinner', 'lunch','porridge','rolls', 'breakfast'];

        // Filtering the results by only storing food-related images directly
        const filteredImages = data.results.filter(image => {
            return image.tags.some(tag => foodTags.includes(tag.title.toLowerCase()));
        });

        console.log("Filtered Images:", filteredImages);

        if (filteredImages.length > 0) {
            return filteredImages;
        } else {
            // No filtered images found, returning all results
            return data.results;
        }
    } catch (error) {
        console.error("Error fetching images:", error);
        return [];
    }
}

// Export functions
module.exports = {
    getImages
};
