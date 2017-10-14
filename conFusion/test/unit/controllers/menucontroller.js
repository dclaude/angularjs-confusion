/*
- jasmin
use jasmin to write our tests below (beforeEach(), it(), ...)
- karma
then karma is used to launch/run these test in the browser configured in karma.conf.js
*/
describe('Controller: MenuController', function() {
  /*
  load the controller's module  
  la methode beforeEach() peut etre appelee pour configurer ce que l'on veut avant que le test soit demarre
  l'expression module('confusionApp') est une shorthand form de 'angular mocks module' 
  ca va creer un mock module dans lequel on va pouvoir tester notre controller
  ici on va tester notre MenuController
  */
  beforeEach(module('confusionApp'));
  // on declare qques variables que l'on va creer plus tard pdt le test:
  var MenuController, scope, $httpBackend;
  /*
  Initialize the controller and a mock scope  
  on utilise la methode inject() de 'angular mocks' pour injecter qques mock components
  on passer en arg de la function() tous les mocks dont notre MenuController va dependre
  */
  beforeEach(inject(function($controller, _$httpBackend_, $rootScope, menuFactory, baseURL) {
      /*
      place here mocked dependencies: 
      dans controllers.js on voit que notre MenuController depend de $scope et menuFactory
      en plus le MenuController utilise la menuFactory pour acceder a un http server pour recuperer des JSON data
      donc on va creer ci-dessous ces 3 dependencies
      */
      $httpBackend = _$httpBackend_; // on met des underscore pour ne pas avoir de conflicts entre notre variable et l'argument de la function

      /*
      qd le MenuController va appeler le service menuFactory, celui-ci va appeler le http server
      et ce server va etre mocked par le $httpBackend server que l'on configure ci-dessous
      */
      $httpBackend.expectGET(baseURL + "dishes").respond(
         [
            {
               "id": 0,
               "name": "Uthapizza",
               "image": "images/uthapizza.png",
               "category": "mains",
               "label": "Hot",
               "price": "4.99",
               "description": "A",
               "comments":[{}]
            },
            {
               "id": 1,
               "name": "Zucchipakoda",
               "image": "images/zucchipakoda.png",
               "category": "mains",
               "label": "New",
               "price": "4.99",
               "description": "A",
               "comments":[{}]
            }
         ]);

      // on cree un mock scope pour que notre MenuController puisse fonctionner
      scope = $rootScope.$new();
      // on construit les 2 arguments dont le MenuController a besoin (cf signature dans controllers.js)
      MenuController = $controller('MenuController', {
        $scope: scope, menuFactory: menuFactory
      });
      //
      $httpBackend.whenGET(/views.*/).respond(200, '');
      $httpBackend.flush(); // pour que l'on puisse immediatement utiliser le mock http server
  }));

  // set up all the tests
  it('should have showDetails as false', function () {
      // qd on load le controller la variable 'showDetails' doit etre false
      expect(scope.showDetails).toBeFalsy();
  });
  it('should create "dishes" with 2 dishes fetched from xhr', function(){
      /*
      qd on load le controller on va appeler le mock http server 
      et si la response est un success la variable 'showMenu' sera a true
      et la variable 'dishes' sera remplie
      */
      expect(scope.showMenu).toBeTruthy();
      expect(scope.dishes).toBeDefined();
      expect(scope.dishes.length).toBe(2);
  });
  it('should have the correct data order in the dishes', function() {
      // on verifie que les dishes recus dans la http response sont ordonnes comme expected
      expect(scope.dishes[0].name).toBe("Uthapizza");
      expect(scope.dishes[1].label).toBe("New");
  });
  it('should change the tab selected based on tab clicked', function(){
      // par defaut la variable 'tab' est initialisee a 1
      expect(scope.tab).toEqual(1);
      // on simule un click sur le 3eme tab
      scope.select(3);
      // on verifie que ca a fonctionne:
      expect(scope.tab).toEqual(3);
      expect(scope.filtText).toEqual('mains');
  });

});

