(function () {
'use strict';

/*
retrieve (and not create) an angular module named 'confusionApp'
cf 'Creation versus Retrieval' in https://docs.angularjs.org/guide/module
*/
angular.module('confusionApp')
/*
@TODO
- change the json-server url below to the one currently launched
if the json-server and the client are on the same LAN use 192.168.0.1
if the client is on android and the json-server is on a WAN accessed through a http tunnel then use localhost
- ATTENTION this url is used from the javascript code run into the client browser
*/
.constant("baseURL", "http://localhost:3000/")

/*
- we create an angular service to manage the data (our model in the MVC)
these data will come from the server-side in a real application
- create a custom service with the service() api
- use dependency injection to get the $http service and baseURL constant
*/
.service('menuFactory', ['$resource', 'baseURL', function($resource, baseURL) {
   // data/model exposed by our service
   /*
   methods of our service
   we add functions in the service object:
   */
   this.getDishes = function() {
      /*
      - use the $resource module 
      + with an url pattern which can handle collections (/dishes/) and single item (/dishes/:id)
      on pourra faire des appels a query() sans dishId pour recuperer un array de dishes JS objects
      ou en specifiant un dishId pour ne recuperer que une seul dish JS object
      cf examples dans controllers.js
      + with an additional custom method update() to be able to perform http PUT
      on utilisera cette methode update() dans d'autres exercises
      - the object returned can be used to call the $resource methods (.query(), .get(), .save(), .remove(), .delete())
      */
      return $resource(baseURL + "dishes/:id", null, { 'update': { method: 'PUT' } });
   };
   
   this.getPromotions = function() {
      return $resource(baseURL + "promotions/:id", null, null );
   };
}])

// create a custom service with the factory() api
.factory('corporateFactory', ['$resource', 'baseURL', function($resource, baseURL) {
    var corpfac = {};
    // Implement two functions, one named getLeaders,
    // the other named getLeader(index)
    // Remember this is a factory not a service
    corpfac.getLeaders = function() {
       return $resource(baseURL + "leadership/:id", null, null );
    };
    return corpfac;
}])

.service('feedbackFactory', ['$resource', 'baseURL', function($resource, baseURL) {
   this.getFeedback = function() {
      return $resource(baseURL + "feedback/:id", null, { 'update': { method: 'PUT' } });
   };
}])

;

}());

