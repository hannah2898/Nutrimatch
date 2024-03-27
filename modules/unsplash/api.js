const unsplash = "https://api.unsplash.com/";
const unsplash_CLIENT_ID = process.env.unsplash_CLIENT_ID;
const images = []; // Array to store images for each recipe
//function to get images from unsplash API by using the recipe title
async function getImages(recipe) {

    let reqUrl = `${unsplash}/search/photos?client_id=${unsplash_CLIENT_ID}&query=${recipe.title}&orientation=portrait&page=1&per_page=5`;
    const response = await fetch(reqUrl);
    const data = await response.json();

    const foodTags = ['food', 'meal', 'cooking', 'recipe', 'restaurant'];

    // Filtering the results by only storing food related images directly
    const filteredImages = data.results.filter(image => {
        return image.tags.some(tag => foodTags.includes(tag.title.toLowerCase()));
    });

    console.log(reqUrl);
    console.log("filtered", filteredImages);

    if (filteredImages.length > 0) {
        return filteredImages;
    } else {
        // No filtered images found, returning all results
        return data.results;
    }
}
//export functions
module.exports = {
    getImages
};
