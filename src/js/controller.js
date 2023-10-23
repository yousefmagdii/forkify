import * as model from './model.js' 
import {MODAL_CLOSE_SEC} from './config.js'
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';


import 'core-js/stable';
import 'regenerator-runtime/runtime'

// if (module.hot){
//   module.hot.accept();
// }


// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipes = async function() {
  try {
    const id = window.location.hash.slice(1);

    if(!id) return;
    recipeView.renderSpinner();
    // 0) Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    // 1) Updating Bookmarks View
    bookmarksView.render(model.state.bookmarks);
    
    // 2) Loading Recipe 
    await model.loadRecipe(id);
    
    // 3) Rendering Recipe 
    recipeView.render(model.state.recipe);
    

  } catch (err) {
    recipeView.renderError(); 
    console.error(err);

  }

};

controlRecipes();
['hashchange', 'load'].forEach(ev=> window.addEventListener(ev, controlRecipes));


const controlSearchResults = async function(){
  try {
    resultsView.renderSpinner();
    //1) Get Search Query
    const query = searchView.getQuery();
    if(!query) return;
    
    //2) Load Search Query
    await model.loadSearchResults(query)
    //3) Render Results
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());
    
    //4) Render initial pagination buttons
    paginationView.render(model.state.search);
    // console.log(paginationView.render(model.state.search));
  } catch (err) {
    console.error(err)
  }
};

const controlPagination = function(goToPage){
    //1) Render New Results
    resultsView.render(model.getSearchResultsPage(goToPage));

    //2) Render New pagination buttons
    paginationView.render(model.state.search);
};
const controlServings = function(newServings){
  //Update the recipe servings
  model.updateServings(newServings);

  //Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
  
}

const controlAddBookmark = function(){
  // 1) Add/ Remove Bookmark
  if(!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  // 2) Update recipe view
  recipeView.update(model.state.recipe);
  // 3) Render bookmarks
  bookmarksView.render(model.state.bookmarks)
}

const controlBookmarks = function(){
  bookmarksView.render(model.state.bookmarks)
}

const controlAddRecipe = async function (newRecipe){
  try {
    // Show loading spinner
    addRecipeView.renderSpinner();
    // Upload the new recipe data
    await model.uploadRecipe(newRecipe);
    // console.log(model.state.recipe);

    //Render recipe
    recipeView.render(model.state.recipe);

    //Success message
    addRecipeView.renderMessage();
    //Render bookmark view
    bookmarksView.render(model.state.bookmarks);
    //Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`)
    //Close form window
    setTimeout(function()  {
      addRecipeView.toggleWindow();
      location.reload();
      
    },MODAL_CLOSE_SEC * 1000);


  } catch (error) {
    console.error('*-*-*-*',error);
    addRecipeView.renderError(error.message)
  }
}


const init = function(){

  bookmarksView.addHandlerRender(controlBookmarks)
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();
// window.addEventListener('hashchange', controlRecipes);
// window.addEventListener('load', controlRecipes);