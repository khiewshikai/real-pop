var myApp = angular.module('starter.controllers', ['firebase', 'angular-datepicker']);

// login and sign up controller
myApp.controller("LoginCtrl", function ($scope, MasterDataService,$ionicLoading) {
    // initialise a model object to bind input form
    $scope.model = {};

    $scope.login = function () {
        var login = MasterDataService.authenticateUser($scope.model.username, $scope.model.password);
        if (login) {
            window.location = '#/home';
        } else {
            $scope.errorMsg = "Opps! Wrong username and/or password!";
        }
    };
    
    $scope.signup = function () {
        console.log($scope.model.newEmail);
        console.log($scope.model.newPW);
        console.log($scope.model.newCfmPW);
        $ionicLoading.show({ template: 'Item Added!', noBackdrop: true, duration: 2000 });
    };
});


myApp.controller('EventIndexCtrl', function ($scope, EventService, $ionicModal, MasterDataService) {

    // get events from service
    $scope.events = EventService.all();
    
    // pop up dialog
    $ionicModal.fromTemplateUrl('add-members.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modal = modal;
    });
    $scope.openModal = function () {
        $scope.modal.show();
    };
    $scope.closeModal = function () {
        $scope.modal.hide();
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.modal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function () {
        // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function () {
        // Execute action
    });
});


//// A simple controller that shows a tapped item's data
//myApp.controller('EventIndexCtrl', function($scope, EventService, $ionicModal) {
//  // "Pets" is a service returning mock data (services.js)
//  $scope.events = EventService.all();
//  $ionicModal.fromTemplateUrl('modal.html', function($ionicModal) {
//        $scope.modal = $ionicModal;
//    }, {
//        // Use our scope for the scope of the modal to keep it simple
//        scope: $scope,
//        // The animation we want to use for the modal entrance
//        animation: 'slide-in-up'
//    });  
//})


// A simple controller that shows a tapped item's data
myApp.controller('EventDetailCtrl', function ($scope, $stateParams, EventService) {
    // "Pets" is a service returning mock data (services.js)
    $scope.event = EventService.get($stateParams.eventId);
});

// A simple controller that fetches a list of data from a service
myApp.controller('ProfileIndexCtrl', function ($scope, ProfileService, $ionicModal) {
    $rootScope.loginUser
});

myApp.controller('ProfileDetailCtrl', function ($scope, $stateParams, ProfileService) {
    // "Pets" is a service returning mock data (services.js)
    $scope.profile = ProfileService.get($stateParams.profileId);
});

myApp.controller('liveLabCtrl', function ($scope, $http) {
    $scope.aaa = function () {
        $http.post('http://athena.smu.edu.sg/hestia/livelabs/index.php/authenticate/login_others ', {username: 'yslim.2012@sis.smu.edu.sg', password: '9402', appid: '140951'}).
                success(function (data, status, headers, config) {
                    $scope.result = status;
                    console.log(status);
                }).
                error(function (data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });
    };
});

myApp.controller('locationCtrl', function ($scope, $ionicLoading) {

    $scope.positions = [{
            lat: 1.292849,
            lng: 103.858993
        }];

    $scope.$on('mapInitialized', function (event, map) {
        $scope.map = map;
    });

    $scope.centerOnMe = function () {
        $scope.positions = [];


        $ionicLoading.show({
            template: 'Loading...'
        });


        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            $scope.positions.push({lat: pos.k, lng: pos.B});
            console.log(pos);
            $scope.map.setCenter(pos);
            $ionicLoading.hide();
        });

    };

});

        