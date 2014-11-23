var myApp = angular.module('starter', ['ionic', "firebase", 'starter.services', 'starter.controllers', 'ngCordova']);


myApp.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider

            .state('login', {
                url: '/login',
                templateUrl: 'templates/login.html',
                controller: 'LoginCtrl'
            })
            
            .state('signup', {
                url: '/signup',
                templateUrl: 'templates/signup.html',
                controller: 'LoginCtrl'
            })

            .state('home', {
                url: '/home',
                templateUrl: 'templates/home.html',
                controller: 'HomeCtrl'
            })

            .state('addfriend', {
                url: '/addfriend',
                templateUrl: 'templates/addfriend.html',
                controller: 'AddFriendCtrl'
            })

            .state('addevent', {
                url: '/addevent',
                templateUrl: 'templates/addevent.html',
                controller: 'AddEventCtrl'
            })

            .state('event', {
                url: '/event/:eventId',
                templateUrl: 'templates/eventdetails.html',
                controller: 'EventDetailCtrl'
            })
            .state('profile', {
                url: '/profile',
                templateUrl: 'templates/profile.html',
                controller: 'ProfileIndexCtrl'
            })
            .state('ranking', {
                url: '/ranking',
                templateUrl: 'templates/ranking.html',
                controller: 'RankingCtrl'
            })
            
            .state('newsfeed', {
                url: '/newsfeed',
                templateUrl: 'templates/newsfeed.html',
                controller: 'NewFeedCtrl'
            })
            
            .state('livelab', {
                url: '/livelab',
                templateUrl: 'templates/liveLabLogin.html',
                controller: 'liveLabCtrl'
            })
            .state('location', {
                url: '/location',
                templateUrl: 'templates/location.html',
                controller: 'locationCtrl'
            });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');

});

