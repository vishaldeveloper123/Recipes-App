

const searchBox = document.querySelector('.searchBox');
const searchBtn = document.querySelector('.searchBtn');
const categoryDropdown = document.querySelector('#categoryDropdown');
const recipeContainer = document.querySelector('.recipe-container');
const recipeDetailsContent = document.querySelector('.recipe-details-content');
const recipeCloseBtn = document.querySelector('.recipe-close-Btn');

// Fetch categories for dropdown
const fetchCategories = async () => {
    try {
        const response = await fetch("https://www.themealdb.com/api/json/v1/1/categories.php");
        const data = await response.json();
        
        data.categories.forEach((category, index) => {
            const option = document.createElement('option');
            option.value = category.strCategory;
            option.textContent = category.strCategory;
            categoryDropdown.appendChild(option);
            
            // Load recipes for the first category by default
            if (index === 0) {
                fetchRecipesByCategory(category.strCategory);
            }
        });
    } catch (error) {
        console.error("Error fetching categories", error);
    }
};

// Function to fetch recipes
const fetchRecipes = async (query) => {
    recipeContainer.innerHTML = "<h2>Fetching recipes...</h2>";
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
        const data = await response.json();

        recipeContainer.innerHTML = "";
        
        if (!data.meals) {
            recipeContainer.innerHTML = "<h2>No recipes found.</h2>";
            return;
        }

        data.meals.forEach(meal => {
            const recipeDiv = document.createElement('div');
            recipeDiv.classList.add('recipe');
            recipeDiv.innerHTML = `
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                <h3>${meal.strMeal}</h3>
                <p><span>${meal.strArea}</span> Dish</p>
                <p>Category: <span>${meal.strCategory}</span></p>
                <button class="view-recipe-btn">View Recipe</button>
            `;

            recipeDiv.querySelector('.view-recipe-btn').addEventListener('click', () => openRecipePopup(meal));
            recipeContainer.appendChild(recipeDiv);
        });
    } catch (error) {
        recipeContainer.innerHTML = "<h2>Error fetching recipes.</h2>";
    }
};

// Function to fetch recipes by category
const fetchRecipesByCategory = async (category) => {
    if (!category) return;
    recipeContainer.innerHTML = "<h2>Fetching recipes...</h2>";
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
        const data = await response.json();

        recipeContainer.innerHTML = "";
        
        if (!data.meals) {
            recipeContainer.innerHTML = "<h2>No recipes found.</h2>";
            return;
        }

        data.meals.forEach(meal => {
            const recipeDiv = document.createElement('div');
            recipeDiv.classList.add('recipe');
            recipeDiv.innerHTML = `
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                <h3>${meal.strMeal}</h3>
                <button class="view-recipe-btn">View Recipe</button>
            `;
            
            recipeDiv.querySelector('.view-recipe-btn').addEventListener('click', () => fetchRecipeDetails(meal.idMeal));
            recipeContainer.appendChild(recipeDiv);
        });
    } catch (error) {
        recipeContainer.innerHTML = "<h2>Error fetching recipes.</h2>";
    }
};

// Function to fetch recipe details
const fetchRecipeDetails = async (mealId) => {
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
        const data = await response.json();
        openRecipePopup(data.meals[0]);
    } catch (error) {
        console.error("Error fetching recipe details", error);
    }
};

// Function to open recipe popup
const openRecipePopup = (meal) => {
    recipeDetailsContent.innerHTML = `
        <h2>${meal.strMeal}</h2>
        <h3>Ingredients:</h3>
        <ul>${fetchIngredients(meal)}</ul>
        <h3>Instructions:</h3>
        <p>${meal.strInstructions}</p>
    `;
    document.querySelector('.recipe-details').style.display = "block";
};

// Fetch ingredients
const fetchIngredients = (meal) => {
    let ingredientsList = "";
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        if (ingredient) {
            ingredientsList += `<li>${meal[`strMeasure${i}`]} ${ingredient}</li>`;
        }
    }
    return ingredientsList;
};

recipeCloseBtn.addEventListener('click', () => {
    document.querySelector('.recipe-details').style.display = "none";
});

searchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    fetchRecipes(searchBox.value.trim());
});

categoryDropdown.addEventListener('change', () => fetchRecipesByCategory(categoryDropdown.value));

fetchCategories();
