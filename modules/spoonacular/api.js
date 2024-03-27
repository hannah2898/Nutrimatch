const spoonacular= "https://api.spoonacular.com";
const spoonacular_API_KEY=process.env.Spoonacular_API_KEY;

//function to get the recipes with requirements entered in the form by the user
async function getRecipes(cuisine,diet,intolerances,ingredients){
    let reqUrl = `${spoonacular}/recipes/complexSearch?apiKey=${spoonacular_API_KEY}&query=${ingredients}&cuisine=${cuisine}&diet=${diet}&intolerances=${intolerances}`;
    console.log(reqUrl);
    var response = await fetch(
        reqUrl,
        {
            method:"GET",
            headers: {
                "Content-type":"application/json",
            }
        }
    );
   
    return await response.json();

}
//function to fetch the recipe and nutrient information of the food item that was selected
async function showRecipe(id){
    console.log("inside showRecipe");
    let reqUrl = `${spoonacular}/recipes/${id}/information?apiKey=${spoonacular_API_KEY}&includeNutrition=true`;
    console.log(reqUrl);
    var response = await fetch(
        reqUrl,
        {
            method:"GET",
            headers: {
                "Content-type":"application/json",
            }
        }
    );
    
    return await response.json();
}
//function exports
module.exports ={
    getRecipes,
    showRecipe
}