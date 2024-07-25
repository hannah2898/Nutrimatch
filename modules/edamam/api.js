const edamam = "https://api.edamam.com";
const edamam_API_KEY = process.env.Edamam_API_KEY;
const edamam_API_ID = process.env.Edamam_API_ID;

// Function to get the recipes with requirements entered in the form by the user
async function getRecipes(cuisine, diet, intolerances, ingredients) {
    let reqUrl = `${edamam}/api/recipes/v2?type=public`;

    // Append app_id and app_key
    reqUrl += `&app_id=${encodeURIComponent(edamam_API_ID)}`;
    reqUrl += `&app_key=${encodeURIComponent(edamam_API_KEY)}`;

    // Append health parameters
    if (diet) {
        if(diet==="Gluten Free"){
            reqUrl += `&health=${encodeURIComponent("gluten-free")}`;
        }
        else if(diet==="Ketogenic"){
            reqUrl += `&health=${encodeURIComponent("keto-friendly")}`;
        }
        else if((diet==="Vegetarian")||(diet==="Lacto-Vegetarian")||(diet==="Ovo-Vegetarian")){
            reqUrl += `&health=${encodeURIComponent("vegetarian")}`;
        }
        else if(diet==="Vegan"){
            reqUrl += `&health=${encodeURIComponent("vegan")}`;
        }
        else if(diet==="Pescetarian"){
            reqUrl += `&health=${encodeURIComponent("pecatarian")}`;
        }
        else if((diet==="Paleo")||(diet==="Primal")){
            reqUrl += `&health=${encodeURIComponent("paleo")}`;
        }
        else if(diet==="Low FODMAP"){
            reqUrl += `&health=${encodeURIComponent("fodmap-free")}`;
        }
        else if(diet==="Whole30"){
            reqUrl += `&health=${encodeURIComponent("sugar-conscious")}&health=${encodeURIComponent("alcohol-free")}&health=${encodeURIComponent("wheat-free")}&health=${encodeURIComponent("dairy-free")}`;
        }
        
        else{
            reqUrl += `&health=${encodeURIComponent(diet)}`;
        }
    }

    // Append cuisineType parameter if cuisine is provided
    if (cuisine) {
        if (cuisine==="Jewish"){
            reqUrl += `&cuisineType=${encodeURIComponent("kosher")}`;
        }
        else if(cuisine==="Southern"){
            reqUrl += `&cuisineType=${encodeURIComponent("south american")}`;
        }
        else if((cuisine==="Thai")||(cuisine==="Vietnamese")){
            reqUrl += `&cuisineType=${encodeURIComponent("south east asian")}`;
        } 
        else{
            reqUrl += `&cuisineType=${encodeURIComponent(cuisine)}`;
        }
        
    }

    // Append q parameter (ingredients)
    if (ingredients) {
        // Split ingredients into an array, trim whitespace, and join with commas
        let ingredientsList = ingredients.split(',').map(item => item.trim()).join(',');
        reqUrl += `&q=${encodeURIComponent(ingredientsList)}`;
    }

    // Append diet parameters (intolerances)
    if (intolerances && intolerances.length > 0) {
        intolerances.forEach(intolerance => {
            if(intolerance==="Diary"){
                reqUrl += `&health=${encodeURIComponent("dairy-free")}`;
            }
            else if(intolerance==="Peanut"){
                reqUrl += `&health=${encodeURIComponent("peanut-free")}`;
            }
            else if((intolerance==="Soy")){
                reqUrl += `&health=${encodeURIComponent("soy-free")}`;
            }
            else if(intolerance==="Sulfite"){
                reqUrl += `&health=${encodeURIComponent("sulfite-free")}`;
            }
            else if(intolerance==="Shellfish"){
                reqUrl += `&health=${encodeURIComponent("shellfish-free")}`;
            }
            else if((intolerance==="Egg")){
                reqUrl += `&health=${encodeURIComponent("egg-free")}`;
            }
            else if(intolerance==="Sesame"){
                reqUrl += `&health=${encodeURIComponent("sesame-free")}`;
            }
            else if(intolerance==="Tree Nut"){
                reqUrl += `&health=${encodeURIComponent("tree-nut-free")}`;
            }
            else if(intolerance==="Wheat"){
                reqUrl += `&health=${encodeURIComponent("wheat-free")}`;
            }
            else if(intolerance==="Seafood"){
                reqUrl += `&health=${encodeURIComponent("fish-free")}`;
            }
            else{
                reqUrl +="";
            }
        });
    }

    console.log(reqUrl);

    try {
        var response = await fetch(reqUrl, {
            method: "GET",
            headers: {
                "Content-type": "application/json",
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching recipes:", error);
        return {}; // Return empty object or handle error as per your application's needs
    }
}

// Function to fetch the recipe and nutrient information of the food item that was selected
async function showRecipe(id) {
    id = id.replace(/"/g, '');
    console.log("inside showRecipe");
    let reqUrl = `${edamam}/api/recipes/v2/${id}?type=public&app_id=${edamam_API_ID}&app_key=${edamam_API_KEY}`;
    console.log(reqUrl);

    try {
        var response = await fetch(reqUrl, {
            method: "GET",
            headers: {
                "Content-type": "application/json",
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching recipe details:", error);
        return {}; // Return empty object or handle error as per your application's needs
    }
}

// Function exports
module.exports = {
    getRecipes,
    showRecipe
};
