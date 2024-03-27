const express = require("express"); //including or importing express in this app
const path = require("path"); //module to help with file path
const dotenv = require("dotenv");
const bodyParser = require('body-parser');
dotenv.config();
const spoonacular =require("./modules/spoonacular/api");
const unsplash =require("./modules/unsplash/api")
var id;
const app = express(); //Create an express app
const port = process.env.PORT || "8888"; //PORT is environment variable for process

//SET UP TEMPLATE ENGINES (PUG)

//first views = the views of this app | second views = views folder
app.set("views",path.join(__dirname,"views")); //set up "views" setting to look in the <__dirname>/views  folder
app.set("view engine","pug");//set up app to use Pug template engine

//SET UP A PATH FOR STATIC FILES
app.use(express.static(path.join(__dirname,"public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//SET UP SOME PAGE ROUTES
app.get("/",async(request,response) =>{
    
    // //response.status(200).send("Test page again"); //This is to test
     response.render("index",{title:"nutrimatch.", animate: true });
});
app.get("/about",async(request,response) =>{
    
    // //response.status(200).send("Test page again"); //This is to test
     response.render("about",{title:"About - nutrimatch.", animate: true });
});
app.get("/findRecipes",async(request,response) =>{
    // //response.status(200).send("Test page again"); //This is to test
     response.render("findRecipes",{title:"Find Recipes - nutrimatch." , animate: true });
});
app.post("/findRecipe/submit",async(request,response)=>{
    //retrieve values from Submitted form here
    let cuisine= request.body.cuisine;
    let diet= request.body.diet;
    let intolerances = Array.isArray(request.body.intolerances) ? request.body.intolerances : [];
    let ingredients=request.body.ingredients;
    let showList= await spoonacular.getRecipes(cuisine,diet,intolerances,ingredients);
    console.log("showList"+showList);
    if((showList.results.length===0)){
        console.log("norecipe");
        response.render("norecipe",{title:"Recipe List"});
    }
    else{
        // Encode the showList data as a URL query parameter
    let encodedShowList = encodeURIComponent(JSON.stringify(showList));
    console.log("encodedList"+encodedShowList);
    response.redirect(`/Recipes?showList=${encodedShowList}`);
    }
    

});
app.get("/Recipes", (request, response) => {
    // Decode the showList data from the query parameter
    let encodedShowList = request.query.showList;
    let showList = JSON.parse(decodeURIComponent(encodedShowList));
    console.log("decoded"+showList);
    response.render("recipeList",{title:"Recipe List",recipes:showList.results});
});
app.get(`/selectedrecipe/:id`,async(request,response) =>{
    let id = request.params.id;
    console.log("show id "+id);
    let showRecipe= await spoonacular.showRecipe(id);
    let imageList = await unsplash.getImages(showRecipe);
    console.log("imageList "+imageList);
    response.render("recipe",{title:"Recipe - nutrimatch.",animate: true,recipe:showRecipe,images:imageList});
});
app.listen(port,()=>{
    console.log(`Listening on http://localhost:${port}`)
})
