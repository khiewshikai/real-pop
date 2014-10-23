angular.module('starter.controllers', ['angular-datepicker'])


// A simple controller that fetches a list of data from a service
.controller('EventIndexCtrl', function($scope, EventService, $ionicModal) {
  // "Pets" is a service returning mock data (services.js)
  $scope.events = EventService.all();
  $ionicModal.fromTemplateUrl('modal.html', function($ionicModal) {
        $scope.modal = $ionicModal;
    }, {
        // Use our scope for the scope of the modal to keep it simple
        scope: $scope,
        // The animation we want to use for the modal entrance
        animation: 'slide-in-up'
    });  
})


// A simple controller that shows a tapped item's data
.controller('EventDetailCtrl', function($scope, $stateParams, EventService) {
  // "Pets" is a service returning mock data (services.js)
  $scope.event = EventService.get($stateParams.eventId);
});
