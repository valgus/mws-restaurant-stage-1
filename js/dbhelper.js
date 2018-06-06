
/*
functions to the IndexDB
*/

class IndexDBHelper {

  /*
    Add restaurant
  */
  static addRestaurant(data, dbPromise, callback) {
    if (dbPromise && data) {
      dbPromise.then((db) => {
        if (!db) callback('Something goes wrong');
        const tx = db.transaction('info', 'readwrite');
        const info = tx.objectStore('info');
        info.add(data);
        return tx.complete;
      }).then(() => {
        callback(null);
      })
    } else {
      const error = "IndexDb is not supported."
      return callback(error);
    }
  }

    /*
      Get restaurant by id
    */
  static getRestaurant(id, dbPromise, callback) {
    if (dbPromise && id) {
      dbPromise.then((db) => {
        if (!db) callback('Something goes wrong');
        return db.transaction('info', 'readonly')
          .objectStore('info').get(parseInt(id));
      }).then(obj => callback(null, obj));
    } else {
      const error = "IndexDb is not supported."
      return callback(error);
    }
  }

    /*
      Get all restaurants
    */
  static getRestaurants(dbPromise, callback) {
    if (dbPromise) {
      dbPromise.then((db) => {
        if (!db) callback('Something goes wrong');
        return db.transaction('info', 'readonly')
          .objectStore('info').getAll();
      }).then(objs => callback(null, objs));
    } else {
      const error = "IndexDb is not supported."
      return callback(error);
    }
  }
}
