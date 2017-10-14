/*
IMPORTANT javascript strict mode: http://www.w3schools.com/js/js_strict.asp
function form of 'use strict' http://stackoverflow.com/questions/4462478/jslint-is-suddenly-reporting-use-the-function-form-of-use-strict
*/
(function () {
'use strict'; // this function is strict

/*
- create an angular module named 'confusionApp' (create: because of the [] argument)
cf 'Creation versus Retrieval' in https://docs.angularjs.org/guide/module
- use the dependency injection to include ui-router module and the ngResource module
- @TODO:
regarder dans mobile_app.txt comment on peut utiliser un 'resolve object'
pour deplacer dans app.js tout les code asynchrone qui se trouve dans controllers.js
*/
angular.module('confusionApp', ['ui.router', 'ngResource'])
   .config(function($stateProvider, $urlRouterProvider) {
      $stateProvider
      // route for the home page
      .state('app', {
         url:'/',
         /*
         multiple views:
         dans cet example on a 3 ui-views: le header, le content et le footer
         ca nous permet de diviser notre webpage en 3 parties
         */ 
         views: {
            'header': {
               templateUrl : 'views/header.html'
            },
            'content': {
               templateUrl : 'views/home.html',
               controller  : 'IndexController'
            },
            'footer': {
               templateUrl : 'views/footer.html'
            }
         }
      })
      /*
      route for the aboutus page
      le state 'app.aboutus' est "nested" dans le parent state 'app'
      */
      .state('app.aboutus', {
         url:'aboutus',
         views: {
         /*
         nested state (nested view)
         TRES TRES IMPORTANT
         comme on est dans un 'nested state' on herite des views de notre parent state 'app'
         et en utilisant le name d'une ui-view de notre parent state suivi d'une '@' 
         on n'override que certaines des ui-views de notre parent state (ici on n'override que la view 'content')
         */
            'content@': {
               templateUrl : 'views/aboutus.html',
               controller  : 'AboutController'              
            }
         }
      })
      // route for the contactus page
      .state('app.contactus', {
         url:'contactus',
         views: {
            'content@': {
               templateUrl : 'views/contactus.html',
               controller  : 'ContactController'
            }
         }
      })
      // route for the menu page
      .state('app.menu', {
         url: 'menu',
         views: {
            'content@': {
               templateUrl : 'views/menu.html',
               controller  : 'MenuController'
            }
         }
      })
      // route for the dishdetail page
      .state('app.dishdetails', {
         url: 'menu/:id',
         views: {
            'content@': {
               templateUrl : 'views/dishdetail.html',
               controller  : 'DishDetailController'
            }
         }
      });

      /*
      on utilise le $urlRouterProvider pour specifier la default route:
      cette default route est utilisee si le state de notre app a une value qui n'appartient pas aux values listees ci-dessus (1er arg de state())
      ici on utilise le state 'app' qui est associe a l'url '/' ci-dessus
      */
      $urlRouterProvider.otherwise('/');
   });

}());
