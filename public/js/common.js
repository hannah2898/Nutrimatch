document.addEventListener('DOMContentLoaded', function() {
    const ingredientsButton = document.getElementById('ingredients');
    const nutritionButton = document.getElementById('nutrition');
    const ingredientInfo = document.querySelector('.ingredient-info');
    const nutrientInfo = document.querySelector('.nutrient-info');

    // Set initial state
    ingredientsButton.classList.add('active');
    ingredientInfo.classList.add('active');

    ingredientsButton.addEventListener('click', function() {
        ingredientsButton.classList.add('active');
        nutritionButton.classList.remove('active');
        ingredientInfo.classList.add('active');
        nutrientInfo.classList.remove('active');
    });

    nutritionButton.addEventListener('click', function() {
        nutritionButton.classList.add('active');
        ingredientsButton.classList.remove('active');
        nutrientInfo.classList.add('active');
        ingredientInfo.classList.remove('active');
    });
   
    
    const ingredientItems = document.querySelectorAll('.ingredient');

//     ingredientItems.forEach(item => {
//         item.addEventListener('click', function(event) {
//             const ingredientName = item.getAttribute('data-name');
//             if (item.classList.contains('added')) {
//                 removeFromDatabase(ingredientName);
//                 showNotification(event.clientX, event.clientY, `${ingredientName} removed from the list.`);
//                 item.classList.remove('added');
//             } else {
//                 addToDatabase(ingredientName);
//                 showNotification(event.clientX, event.clientY, `${ingredientName} added to the list.`);
//                 item.classList.add('added');
//             }
//         });
//     });

//     function addToDatabase(ingredient) {
//         // Placeholder function for adding ingredient to the database
//         console.log(`Adding ${ingredient} to the database.`);
//     }

//     function removeFromDatabase(ingredient) {
//         // Placeholder function for removing ingredient from the database
//         console.log(`Removing ${ingredient} from the database.`);
//     }

//     function showNotification(x, y, message) {
//         const notification = document.createElement('div');
//         notification.classList.add('notification');
//         notification.textContent = message;
//         document.body.appendChild(notification);

//         // Position the notification near the cursor
//         notification.style.top = `${y}px`;
//         notification.style.left = `${x + 20}px`; // Add 20px offset to the right of the cursor

//         // Fade out the notification after 2 seconds
//         setTimeout(() => {
//             notification.style.opacity = '0';
//             setTimeout(() => {
//                 document.body.removeChild(notification);
//             }, 1000); // Remove the notification after fade out
//         }, 2000); // 2000 milliseconds = 2 seconds
//     }
 });
