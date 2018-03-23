let restaurants,
  neighborhoods,
  cuisines
var map
var markers = []

/**
* Set title to iframe used by the Google maps
*/

const iframes = document.getElementsByTagName('iframe');
for (const iframe of iframes) {
  if (window.location.pathname.contains("id=")) {
    iframe.title = "Map with restaurant"
  } else {
    iframe.title = "Map with restaurants";
  }
}

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  select.size = neighborhoods.length + 1;
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    option.id = "n-" + neighborhood;
    option.setAttribute("role", "menuitem");
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');
  select.size = cuisines.length + 1;

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    option.id = "c-" + cuisine;
    option.setAttribute("role", "menuitem");
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = (updateType) => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  //set activedescendant
  cSelect.setAttribute( "aria-activedescendant", cSelect[cIndex].id);
  nSelect.setAttribute("aria-activedescendant", nSelect[nIndex].id);

  if (updateType === 3) {
    document.getElementById('cuisinebutton').innerHTML = "<i class='fas fa-filter'></i> Cuisines: " + cuisine;
  } else if (updateType === 2) {
    document.getElementById('neighborhoodbutton').innerHTML = "<i class='fas fa-filter'></i> Location: " + neighborhood;
  }

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  li.className = 'restaurant-box';
  li.setAttribute("role", "menuitem");
  li.setAttribute("aria-label", restaurant.name + " box");
  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant, true, true);
  image.srcset = DBHelper.imageUrlForRestaurant(restaurant, true, true).concat(" 1x, ").concat(DBHelper.imageUrlForRestaurant(restaurant, false, true)).concat(" 2x");
  image.alt = "Restaurant: " + restaurant.name;
  image.title = restaurant.name;
  li.append(image);

  const restaurantInfo = document.createElement('div');
  restaurantInfo.className = 'restaurant-info';

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  restaurantInfo.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  restaurantInfo.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  restaurantInfo.append(address);

  const more = document.createElement('a');
  more.setAttribute("role", "button");
  more.innerHTML = 'View Details';
  more.setAttribute("aria-label", "View details about " + restaurant.name)
  more.href = DBHelper.urlForRestaurant(restaurant);
  restaurantInfo.append(more);

  li.append(restaurantInfo);
  return li
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}

/**
* Show filter select element when button is clicked
*/
showFilterSelect = (elementId) => {
    const select = document.getElementById(elementId);
    select.removeAttribute('aria-hidden');
    select.focus();
}

closeFilterSelect = (elementId) => {
    const select = document.getElementById(elementId);
    select.setAttribute('aria-hidden', true);
}
