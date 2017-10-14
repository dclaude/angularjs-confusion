(function () {
'use strict';

/*
ce fichier contient la definition des differents controllers de notre MVC
ce sont les routes configurees dans app.js qui vont determiner quel controller est utilise pour une url donnee
*/

/*
retrieve (and not create) an angular module named 'confusionApp'
cf 'Creation versus Retrieval' in https://docs.angularjs.org/guide/module
*/
angular.module('confusionApp')

/*
- create a controller named 'MenuController'
IMPORTANT: the accepted Angular convention of naming the controllers is to start with a Capital letter
- use dependency injection (method1: inline array annotation) to inject two dependencies/services:
+ an angular built-in service: $scope
+ a custom service defines in app/services.js: 'menuFactory'
the menuFactory service is there to provide the model data to the controller
- @TODO:
regarder dans mobile_app.txt comment on peut utiliser un 'resolve object'
pour deplacer dans app.js tout les code asynchrone qui se trouve dans controllers.js
*/
.controller('MenuController', ['$scope', 'menuFactory', function($scope, menuFactory) {
   /*
   the tabs are given indices 1..4 
   the variable 'tab' will keep track of the currently active tab
   */
   $scope.tab = 1;
   /* 
   angular filter:
   initially since the first tab is selected as default, the filtText should not filter out any item from the menu
   */
   $scope.filtText = '';
   $scope.showDetails = false;

   // retrieve data from our service:
   $scope.showMenu = false;
   $scope.message = "Loading ...";
   /*
   - async call
   use the $resource module to send http requests to the server
   here we use query() to perform a http GET on the /dishes url
   - method1 http error handler
   on passe en arg des success/error callbacks
   */
   menuFactory.getDishes().query(
       function(response) {
           // dans la success callback, l'arg response contient le body de la http response
           $scope.dishes = response;
           $scope.showMenu = true;
       },
       function(response) {
           /*
           dans la error callback, l'arg response contient la http response complete 
           (et pas seulement le body)
           */
           $scope.message = "Error: " + response.status + " " + response.statusText;
       });

   /*
   this function will set the tab variable to the selected tab index
   and will then update the filtText variable use for the angular filter
   */
   $scope.select = function(setTab) {
      $scope.tab = setTab;
      if (setTab === 2) {
         $scope.filtText = "appetizer";
      }
      else if (setTab === 3) {
         $scope.filtText = "mains";
      }
      else if (setTab === 4) {
         $scope.filtText = "dessert";
      }
      else {
         $scope.filtText = "";
      }
   };
   // this function will return true if the current tab is the same as the tab specified in the function parameter
   $scope.isSelected = function(checkTab) {
      return ($scope.tab === checkTab);
   };
   $scope.toggleDetails = function() {
      $scope.showDetails = !$scope.showDetails;
   };
}])

.controller('ContactController', ['$scope', function($scope) {
    $scope.feedback = { mychannel: "", firstName: "", lastName: "", agree: false, email: "" };
    // the array below contains the value/label used to build the items of the <select> in contactus.html
    var channels = [{value:"tel", label:"Tel."}, {value:"Email",label:"Email"}];
    $scope.channels = channels;
    $scope.invalidChannelSelection = false;
}])

.controller('FeedbackController', ['$scope', 'feedbackFactory', function($scope, feedbackFactory) {
   /*
   - inheritance of scopes
   FeedbackController is a nested scope so it can access all the properties of its parent scope (ContactController)
   for instance the 'feedback' property defined in the parent scope is used below
   - form validation: the function below is called when the submit button is clicked in contactus.hmtl
   */
   $scope.sendFeedback = function() {
      console.log($scope.feedback);
      /*
      example of manual <input> field validation:
      we check that the value of the <select> in contactus.html is valid
      otherwise the 'invalidChannelSelection' property is set to true
      and this is used in the html to notify the user that the value is invalid
      */
      if ($scope.feedback.agree && ($scope.feedback.mychannel === "")) {
         $scope.invalidChannelSelection = true;
         console.log('incorrect');
      }
      else {
         // http POST: save our 'javascript object' on the server-side (in the db.json of the json-server)
         feedbackFactory.getFeedback().save($scope.feedback);

         /*
         - if the form is valid we reset the form-related data
         since we use two-way data binding we only need to reset the scope properties and the html will also be reset
         - in real production code we would have sent an ajax request to the server-side with the form data
         */
         $scope.invalidChannelSelection = false;
         $scope.feedback = { mychannel: "", firstName: "", lastName: "", agree: false, email: "" };
         $scope.feedback.mychannel= "";
         // reset all the form fields to the status 'pristine' (as if the user never modified any of these fields)
         $scope.feedbackForm.$setPristine();
         // print the 'feedback' JS object in the log:
         console.log($scope.feedback);
      }
   };
}])

/*
dependency injection: 
use $stateParams to retrieve the parameter given in the state transition in menu.html (dish id)
the states are configured in app.js
*/
.controller('DishDetailController', ['$scope', '$stateParams', 'menuFactory', function($scope, $stateParams, menuFactory) {
   // cf explanation in paragraph '$routeParams / url parameter'
   var dishId = parseInt($stateParams.id, 10);
   //
   $scope.showDish = false;
   $scope.message = "Loading ...";
   /*
   - async call
   use the $resource module to perform a http GET with a id parameter in the url (/dishes/:id)
   - method2 http error handler
   ici on utilise une promise pour setter des success/error callbacks
   */
   $scope.dish = menuFactory.getDishes().get({ id: dishId })
      .$promise.then(
            function(response){
               $scope.dish = response;
               $scope.showDish = true;
            },
            function(response) {
               $scope.message = "Error: " + response.status + " " + response.statusText;
            });
}])

// nested scope (parent scope is DishDetailController)
.controller('DishCommentController', ['$scope', 'menuFactory', function($scope, menuFactory) {
   function initComment() {
      return { author: "", rating: 5, comment: "", date: "" };
   }
   // Step 1: Create a JavaScript object to hold the comment from the form
   //
   // form data for two-way data binding:
   $scope.mycomment = initComment();
   // JS array for ng-repeat in rating radio:
   $scope.ratingValues = [ 1, 2, 3, 4, 5 ];
   //
   $scope.submitComment = function () {
      //Step 2: This is how you record the date
      $scope.mycomment.date = new Date().toISOString();
      console.log($scope.mycomment);
      // Step 3: Push your comment into the dish's comment array
      $scope.dish.comments.push($scope.mycomment);

      /*
      on fait un http PUT du dish pour updater le dish sur le server-side
      on appelle la $resource 'custom method' update() que l'on a ajoute dans services.js
      le 1er arg est le parameter (dishId) a utiliser dans l'url
      le 2eme arg est le JS object que l'on va mettre dans le body JSON de notre http request (http PUT)
      */
      menuFactory.getDishes().update({ id: $scope.dish.id }, $scope.dish);

      //Step 4: reset your form to pristine
      $scope.commentForm.$setPristine();
      //Step 5: reset your JavaScript object that holds your comment
      $scope.mycomment = initComment();
   };
}])

// implement the IndexController and About Controller here
.controller('IndexController', ['$scope', 'menuFactory', 'corporateFactory', function($scope, menuFactory, corporateFactory) {
   var featuredDishId = 0; // arbitrary
   $scope.showDish = false;
   $scope.dishMessage = "Loading ...";
   // async call: use the $resource module to perform a http GET with a id parameter in the url (/dishes/:id)
   $scope.dish = menuFactory.getDishes().get({ id: featuredDishId })
      .$promise.then(
            function(response){
               $scope.dish = response;
               $scope.showDish = true;
            },
            function(response) {
               $scope.dishMessage = "Error: " + response.status + " " + response.statusText;
            });

   $scope.showPromotion = false;
   $scope.promotionMessage = "Loading ...";
   var featuredPromotion = 0; // arbitrary
   $scope.promotion = menuFactory.getPromotions().get({ id: featuredPromotion })
      .$promise.then(
            function(response){
               $scope.promotion = response;
               $scope.showPromotion = true;
            },
            function(response) {
               $scope.promotionMessage = "Error: " + response.status + " " + response.statusText;
            });

   $scope.showLeader = false;
   $scope.leaderMessage = "Loading ...";
   var executiveChief = 3; // get executive chief
   $scope.leader = corporateFactory.getLeaders().get({ id: executiveChief })
      .$promise.then(
            function(response){
               $scope.leader = response;
               $scope.showLeader = true;
            },
            function(response) {
               $scope.leaderMessage = "Error: " + response.status + " " + response.statusText;
            });

}])

.controller('AboutController', ['$scope', 'corporateFactory', function($scope, corporateFactory) {
   $scope.showLeaders = false;
   $scope.leadersMessage = "Loading ...";
   $scope.leaders = corporateFactory.getLeaders().query(
      function(response) {
          $scope.leaders = response;
          $scope.showLeaders = true;
      },
      function(response) {
          $scope.leadersMessage = "Error: " + response.status + " " + response.statusText;
      });
}])

;

}());

