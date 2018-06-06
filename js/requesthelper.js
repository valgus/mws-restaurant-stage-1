//db Promise to manage requests to the IndexDb
const dbPromise = (!('indexDB') in window) ? null :
   idb.open('restaurants-db', 1, (upgradeDb) => {
    if (!upgradeDb.objectStoreNames.contains('info')) {
      upgradeDb.createObjectStore('info', {keyPath: 'id'});
    }
  });


/**
 * functions to the server.
 */
class RequestHelper {


  static get SERVER_URL() {
    return 'http://localhost:1337';
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    fetch(RequestHelper.SERVER_URL+'/restaurants').then((response) => {
      if (response.ok) {
        response.json().then(restaurants => {
          //save all restaurants info in the IndexDB
          IndexDBHelper.getRestaurants(dbPromise, (error, storedRestaurants) => {
            //obtain all restaurants that were not saved yet in the IndexDb
            const notSavedRestaurants = restaurants.filter(restaurant => !storedRestaurants.some(storedRestaurant => storedRestaurant.id === restaurant.id ));
            for (const notSavedRestaurant of notSavedRestaurants) {
              IndexDBHelper.addRestaurant(notSavedRestaurant, dbPromise, (err) => {})
            }
            console.log(notSavedRestaurants);
            return callback(null, restaurants);
          });
        });
      } else {// Oops!. Got an error from server.
        const error = (`Request failed. Returned status of ${response.status}`);
        callback(error, null);
      }
    }).catch((e) => {
      //in case of Error, obtain all restaurants from IndexDB
      //save all restaurants info in the IndexDB
      IndexDBHelper.getRestaurants(dbPromise, (error, storedRestaurants) => {
        callback(error, storedRestaurants);
      });
    });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    //check whether indexDB has this restaurant
    IndexDBHelper.getRestaurant(id, dbPromise, (err, restaurant) => {
      if(err || !restaurant) {
        fetch(RequestHelper.SERVER_URL+`/restaurants/${id}`).then((response) => {
          if (response.ok) {
            response.json().then(restaurant => {
              console.log(restaurant);
              if (!restaurant) {
                return callback('Restaurant does not exist', null);
              }
              //add restaurant in case of its lack in the IndexDB
              IndexDBHelper.addRestaurant(restaurant, dbPromise, (err) => {
                return callback(null, restaurant);
              });
            });
          } else {// Oops!. Got an error from server.
            const error = (`Request failed. Returned status of ${response.status}`);
            callback(error, null);
          }
        }).catch((e) => {
          const error = (`Request failed. Error: ${e.message}`);
          callback(error, null);
        });
      } else {
        callback(null, restaurant);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    RequestHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    RequestHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    RequestHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    RequestHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    RequestHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   * if is small image, return image with low resolution, otherwise with medium
   */
  static imageUrlForRestaurant(restaurant, isSmallImage, forMainPage) {
    if (isSmallImage && forMainPage) {
      return (`./img/${restaurant.id}-small.jpg`);
    }
    if (!isSmallImage && forMainPage || isSmallImage && !forMainPage) {
      return (`./img/${restaurant.id}-medium.jpg`);
    }
    return (`./img/${restaurant.id}-large.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: RequestHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}
