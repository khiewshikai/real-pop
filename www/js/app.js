// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.services', 'starter.controllers', 'angular-datepicker'])


.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    // setup an abstract state for the tabs directive
    .state('home', {
      url: '/home',
      templateUrl: 'templates/home.html',
      controller: 'EventIndexCtrl'
    })
    
    .state('addfriend', {
      url: '/addfriend',
      templateUrl: 'templates/addfriend.html',
      controller: 'EventIndexCtrl'
    })
    
    .state('addevent', {
      url: '/addevent',
      templateUrl: 'templates/addevent.html',
      controller: 'EventIndexCtrl'
    })
    
    .state('event', {
      url: '/event/:eventId',
      templateUrl: 'templates/eventdetails.html',
      controller: 'EventDetailCtrl'
    })
    
    
//    .state('event', {
//      url: '/event/:eventId',
//      views: {
//        'events-tab': {
//          templateUrl: 'templates/eventdetails.html',
//          controller: 'EventDetailCtrl'
//        }
//      }
//    })


//    // the pet tab has its own child nav-view and history
//    .state('tab.home', {
//      url: '/home',
//      views: {
//        'pets-tab': {
//          templateUrl: 'templates/home.html',
//          controller: 'PetIndexCtrl'
//        }
//      }
//    })
//
//    .state('tab.addfriend', {
//      url: '/addfriend',
//      views: {
//        'pets-tab': {
//          templateUrl: 'templates/addfriend.html',
//          controller: 'PetDetailCtrl'
//        }
//      }
//    })
//
//    .state('tab.adopt', {
//      url: '/adopt',
//      views: {
//        'adopt-tab': {
//          templateUrl: 'templates/adopt.html'
//        }
//      }
//    })
//
//    .state('tab.about', {
//      url: '/about',
//      views: {
//        'about-tab': {
//          templateUrl: 'templates/about.html'
//        }
//      }
//    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/home');

});

