const express = require("express");
const session = require("express-session");
const path = require("path");
const dotenv = require("dotenv");
const bodyParser = require('body-parser');
const config = require("./config");  // Import config.js
const spoonacular = require("./modules/spoonacular/api");
const edamam = require("./modules/edamam/api");
const unsplash = require("./modules/unsplash/api");
const MongoStore = require('connect-mongo');
const { MongoClient, ObjectId } = require('mongodb'); 
dotenv.config();
console.log("SPOONACULAR_API_KEY:", config.SPOONACULAR_API_KEY);
const dbPassword = process.env.Mongo_Password;
const dbUrl = `mongodb+srv://Admin:${dbPassword}@nutrimatch.ct3pcam.mongodb.net/`;
console.log("dbUrl"+dbUrl);
const client = new MongoClient(dbUrl);

const app = express();
const port = process.env.PORT || "8889";

// Use a secure session secret
const sessionSecret = 'aS3cur3S3cr3tK3y!@#123';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Setup for express-session
app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: dbUrl,
        collectionName: 'sessions',
        ttl: 14 * 24 * 60 * 60 // 14 days
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
        sameSite: 'lax'
    }
}));
// Middleware to check if user is logged in
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});
// SET UP TEMPLATE ENGINES (PUG)
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// SET UP A PATH FOR STATIC FILES
app.use(express.static(path.join(__dirname, "public")));

// SET UP SOME PAGE ROUTES
app.get("/",async(request,response)=>{
    response.render ("login", { title: "Login to nutrimatch", animate: true })
})
app.post("/login/submit", async (request, response) => {
    try {
        const { email, password } = request.body;
        
        // Connect to the database
        const db = await connection();

        // Find user by email
        const user = await db.collection("user_profile").findOne({ email });
        if (!user) {
            return response.status(400).send(`
                <script>
                    alert("Seems like you don't have an account in this email. Please sign up.");
                    window.location.href = "/";
                </script>
            `);
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return response.status(400).send(`
                <script>
                    alert("Invalid email or password.");
                    window.location.href = "/";
                </script>
            `);
        }
        console.log('Session before redirect:', request.session);
        // Store user info in session
        request.session.user = user; // Store the entire user object in session
        response.redirect(`/home`);
    } catch (error) {
        console.error("Error logging in: ", error);
        response.status(500).send("Internal Server Error");
    }
});
const avatars = ['boy1.jpeg', 'girl1.jpeg', 'boy2.jpeg', 'girl2.jpeg', 'boy3.jpeg', 'girl3.jpeg'];
app.get("/signup",async(request,response)=>{
    response.render ("signup", { title: "Sign up to nutrimatch", animate: true,avatars: avatars })
})
// Import necessary modules
const bcrypt = require('bcrypt');  // For password hashing

// Sign-Up Route
app.post("/signup/submit", async (request, response) => {
    try {
        const { name, email, password,avatar } = request.body;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Connect to the database
        const db = await connection();

        // Check if the user already exists
        const existingUser = await db.collection("user_profile").findOne({ email });
        if (existingUser) {
            return response.status(400).send("User already exists. Please login.");
        }

        // Insert new user into the database
        await db.collection("user_profile").insertOne({
            name,
            email,
            password: hashedPassword,
            avatar: avatar

        });

        // Redirect to login page or home page
        response.redirect(`/`);
    } catch (error) {
        console.error("Error signing up: ", error);
        response.status(500).send("Internal Server Error");
    }
});
app.get('/profile', (req, res) => {
    if (req.session.user) {
        const fullName = req.session.user.name;
        const firstName = fullName.split(' ')[0];
        
        // Pass the first name to the template
        res.render('profile', { title: "Profile",user: req.session.user, firstName: firstName,avatars: avatars });
    } else {
        res.redirect('/');
    }
});
app.post("/profile/update", async (req, res) => {
    try {
        const _id = req.body._id;
        const name = req.body.name;
        const email = req.body.email;
        let intolerances = Array.isArray(req.body.intolerances) ? req.body.intolerances : [];
        const avatar = req.body.avatar;
        const diet= req.body.diet;
        const currentPassword = req.body.currentPassword;
        const newPassword = req.body.newPassword;
        const confirmNewPassword = req.body.confirmNewPassword;

        // Connect to the database
        const db = await connection();

        // Update the user information
        await db.collection("user_profile").updateOne(
            { _id: new ObjectId(_id) },
            {
                $set: {
                    name,
                    email,
                    intolerances,
                    avatar,
                    diet
                }
            }
        );

        // If the user wants to change their password
        if (currentPassword && newPassword && confirmNewPassword) {
            if (newPassword !== confirmNewPassword) {
                return res.status(400).send("New passwords do not match.");
            }

            // Fetch the user from the database
            const user = await db.collection("user_profile").findOne({ _id: new ObjectId(_id) });

            // Compare current password
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).send("Current password is incorrect.");
            }

            // Hash the new password
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);

            // Update the password in the database
            await db.collection("user_profile").updateOne(
                { _id: new ObjectId(_id) },
                {
                    $set: {
                        password: hashedNewPassword
                    }
                }
            );
        }

        // Update session user information
        req.session.user.name = name;
        req.session.user.email = email;
        req.session.user.intolerances = intolerances;
        req.session.user.avatar = avatar;
        req.session.user.diet = diet;

        // Redirect to the profile page
        res.redirect("/profile");
    } catch (error) {
        console.error("Error updating profile: ", error);
        res.status(500).send("Internal Server Error");
    }
});
app.post("/profile/change-password", async (req, res) => {
    try {
        const { userId, oldPassword, newPassword, confirmPassword } = req.body;

        // Validate the new password
        if (newPassword !== confirmPassword) {
            return res.status(400).send(`
                <script>
                    alert("New passwords do not match.");
                    window.location.href = "/profile";
                </script>
            `);
        }

        // Connect to the database
        const db = await connection();

        // Find the user by ID
        const user = await db.collection("user_profile").findOne({ _id: new ObjectId(userId) });
        if (!user) {
            return res.status(400).send(`
                <script>
                    alert("User not found.");
                    window.location.href = "/profile";
                </script>
            `);
        }

        // Compare the old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).send(`
                <script>
                    alert("Old password is incorrect.");
                    window.location.href = "/profile";
                </script>
            `);
        }

        // Hash the new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password in the database
        await db.collection("user_profile").updateOne(
            { _id: new ObjectId(userId) },
            { $set: { password: hashedNewPassword } }
        );

        // Redirect to the profile page
        res.send(`
            <script>
                alert("Password changed successfully.");
                window.location.href = "/profile";
            </script>
        `);
    } catch (error) {
        console.error("Error changing password: ", error);
        res.status(500).send("Internal Server Error");
    }
});
// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});
app.get("/likedRecipes", async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/'); // Redirect to login if the user is not authenticated
    }
    const fullName = req.session.user.name;
    const firstName = fullName.split(' ')[0];
    const userId = req.session.user._id;

    try {
        const db = await connection();
        const user = await db.collection("user_profile").findOne({ _id: new ObjectId(userId) });

        if (!user || !user.likedRecipes || user.likedRecipes.length === 0) {
            return res.render("likedRecipes", { title: "Liked Recipes", firstName: firstName, recipes: [], edamamRecipes: [] });
        }

        const likedRecipeIds = user.likedRecipes;
        const spoonacularRecipes = [];
        const edamamRecipes = [];

        for (let i = 0; i < likedRecipeIds.length; i++) {
            if (likedRecipeIds[i].length <= 9) {
                const recipe = await spoonacular.showRecipe(likedRecipeIds[i]);
                spoonacularRecipes.push(recipe);
            } else {
                const recipe = await edamam.showRecipe(likedRecipeIds[i]);
                edamamRecipes.push(recipe);
            }
        }

        res.render("likedRecipes", { title: "Liked Recipes", firstName: firstName, recipes: spoonacularRecipes, edamamRecipes: edamamRecipes });
    } catch (error) {
        console.error('Error fetching liked recipes:', error);
        res.status(500).send("Internal Server Error");
    }
});
app.get('/groceryList', async (req, res) => {
    try {
        
        if (req.session.user) {
            const fullName = req.session.user.name;
            const firstName = fullName.split(' ')[0];
            
            const groceryList = req.session.user.groceryList || [];
            // Parse the JSON string to JavaScript object
            res.render('groceryList', {
                title: 'Grocery List',
                firstName: firstName,
                groceryItems: groceryList
            });
        } else {
            res.redirect('/');
        }
        // Assuming groceryList is stored as a JSON field in a MongoDB document
        const userId = req.session.user._id;
        

    } catch (error) {
        console.error('Error fetching grocery list:', error);
        res.status(500).send('Error fetching grocery list. Please try again later.');
    }
});

// Start server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
app.post('/addIngredient', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const { ingredient } = req.body;
    const userId = req.session.user._id;

    try {
        const db = await connection();
        await db.collection("user_profile").updateOne(
            { _id: new ObjectId(userId) },
            { $addToSet: { groceryList: ingredient } }
        );

        // Fetch the updated grocery list
        const updatedUser = await db.collection("user_profile").findOne({ _id: new ObjectId(userId) });
        req.session.user = updatedUser; // Update the session

        res.json({ message: "Ingredient added successfully", groceryList: updatedUser.groceryList });
    } catch (error) {
        console.error('Error adding ingredient:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/removeIngredient', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const { ingredient } = req.body;
    const userId = req.session.user._id;

    try {
        const db = await connection();
        const ingredientId = isNaN(Number(ingredient.id)) ? ingredient.id : Number(ingredient.id);

        // Define the query based on whether the ID is a string or number
        const query = {
            _id: new ObjectId(userId),
            $or: [
                { "groceryList.id": ingredientId }, // When id is an integer
                { "groceryList.foodId": ingredientId } // When foodId is a string
            ]
        };

        // Remove the ingredient from the groceryList
        const result = await db.collection("user_profile").updateOne(
            query,
            { $pull: { groceryList: { $or: [{ id: ingredientId }, { foodId: ingredientId }] } } }
        );

        // Fetch the updated grocery list
        const updatedUser = await db.collection("user_profile").findOne({ _id: new ObjectId(userId) });
        req.session.user = updatedUser; // Update the session

        res.json({ message: "Ingredient removed successfully", groceryList: updatedUser.groceryList });
    } catch (error) {
        console.error('Error removing ingredient:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



// Existing DB connection function
async function connection() {
    await client.connect();
    return client.db("Nutrimatch");
}

app.get("/home", async (request, response) => {
    console.log('Session after redirect:', request.session);
    response.render("index", { title: "nutrimatch.", animate: true });
});

app.get("/about", async (request, response) => {
    response.render("about", { title: "About - nutrimatch.", animate: true });
});

app.get("/findRecipes", async (request, response) => {
    response.render("findRecipes", { title: "Find Recipes - nutrimatch.", animate: true});
});

app.post("/findRecipe/submit", async (request, response) => {
    try {
        // Retrieve values from Submitted form here
        let cuisine = request.body.cuisine || '';
        let diet = request.body.diet || '';
        let intolerances = Array.isArray(request.body.intolerances) ? request.body.intolerances : [];
        let ingredients = request.body.ingredients || '';

        let showList = await spoonacular.getRecipes(cuisine, diet, intolerances, ingredients);
        let showEdamamList = await edamam.getRecipes(cuisine, diet, intolerances, ingredients);

        console.log("showList: ", showList);
        console.log("showEdamamList: ", showEdamamList);

        if (!showList.results) showList.results = [];
        if (!showEdamamList.hits) showEdamamList.hits = [];

        if ((showList.results.length === 0) && (showEdamamList.hits.length === 0)) {
            response.render("norecipe", { title: "Recipe List" });
        } else {
            // Store data in session
            request.session.showList = showList;
            request.session.showEdamamList = showEdamamList;
            ('Session in findRecipe fetching recipes before redirecting:', request.session);
            response.redirect(`/Recipes`);
        }
    } catch (error) {
        console.error("Error fetching recipes: ", error);
        response.status(500).send("Internal Server Error");
    }
});

app.get("/Recipes", (request, response) => {
    const user = request.session.user || { likedRecipes: [] };
    let showList = request.session.showList || { results: [] };
    let showEdamamList = request.session.showEdamamList || { hits: [] };
    console.log('Session after redirect fetching recipes:', request.session);
    response.render("recipeList", { title: "Recipe List", recipes: showList.results, edamamRecipes: showEdamamList.hits });
});
app.post('/likeRecipe', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const { recipeId, action } = req.body;
    const userId = req.session.user._id;

    try {
        const db = await connection();
        const update = action === 'like' 
            ? { $addToSet: { likedRecipes: recipeId } } 
            : { $pull: { likedRecipes: recipeId } };
        
        await db.collection("user_profile").updateOne(
            { _id: new ObjectId(userId) },
            update
        );

        // Update the session user object
        if (action === 'like') {
            req.session.user.likedRecipes.push(recipeId);
        } else {
            req.session.user.likedRecipes = req.session.user.likedRecipes.filter(id => id !== recipeId);
        }

        res.json({ message: `Recipe ${action}d successfully` });
    } catch (error) {
        console.error('Error liking/unliking recipe:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
app.get(`/selectedrecipe/:id`, async (request, response) => {
    let id = request.params.id;
    if(id.length<=9){
        var showRecipe = await spoonacular.showRecipe(id);
        var imageList = await unsplash.getImages(showRecipe);
        response.render("recipe", { title: "Recipe - nutrimatch.", animate: true, recipe: showRecipe, images: imageList});
    }   
    else{
        var showRecipe = await edamam.showRecipe(id);
        var imageList = await unsplash.getImages(showRecipe);
        response.render("recipeEdamam", { title: "Recipe - nutrimatch.", animate: true, recipe: showRecipe,nutrients:showRecipe.recipe.totalNutrients, images: imageList,id: id});
    }
    
});
app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});