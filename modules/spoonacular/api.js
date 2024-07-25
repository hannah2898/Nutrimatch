const spoonacular = "https://api.spoonacular.com";
const spoonacular_API_KEY = process.env.Spoonacular_API_KEY;
console.log("Inside Spoonacular key" + spoonacular_API_KEY);

// Function to get the recipes with requirements entered in the form by the user
async function getRecipes(cuisine, diet, intolerances, ingredients) {
    let ingredientList = ingredients.split(',').map(ingredient => ingredient.trim()).filter(Boolean);

    // If ingredientList is empty, use a default value
    if (ingredientList.length === 0) {
        ingredientList.push('');  // Push an empty string to make a generic search
    }

    let promises = ingredientList.map(async (ingredient) => {
        let reqUrl = `${spoonacular}/recipes/complexSearch?apiKey=${spoonacular_API_KEY}&query=${ingredient}`;

        if (cuisine) {
            reqUrl += `&cuisine=${cuisine}`;
        }
        if (diet) {
            reqUrl += `&diet=${diet}`;
        }
        if (intolerances) {
            reqUrl += `&intolerances=${intolerances}`;
        }

        console.log(reqUrl);
        var response = await fetch(reqUrl, {
            method: "GET",
            headers: {
                "Content-type": "application/json",
            }
        });
        return await response.json();
    });

    let results = await Promise.all(promises);

    let combinedResults = results.flatMap(result => result.results || []);

    let uniqueResults = Array.from(new Set(combinedResults.map(recipe => recipe.id)))
                             .map(id => combinedResults.find(recipe => recipe.id === id));

    return { results: uniqueResults };
}


// Function to fetch the recipe and nutrient information of the food item that was selected
async function showRecipe(id) {
    console.log("inside showRecipe");
    id = id.replace(/"/g, '');
    let reqUrl = `${spoonacular}/recipes/${id}/information?apiKey=${spoonacular_API_KEY}&includeNutrition=true`;
    console.log(reqUrl);
    var response = await fetch(reqUrl, {
        method: "GET",
        headers: {
            "Content-type": "application/json",
        }
    });
    
    return await response.json();
}

// Function exports
module.exports = {
    getRecipes,
    showRecipe
};
