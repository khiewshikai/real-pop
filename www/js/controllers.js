var myApp = angular.module('starter.controllers', ['firebase', 'angular-datepicker']);

// directive for google Place
myApp.directive('googleplace', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, model) {
            var options = {
                types: [],
                componentRestrictions: {}
            };
            scope.gPlace = new google.maps.places.Autocomplete(element[0], options);
 
            google.maps.event.addListener(scope.gPlace, 'place_changed', function() {
                scope.$apply(function() {
                    model.$setViewValue(element.val());                
                });
            });
        }
    };
});

//myApp.directive('disabletap', function($timeout) {
//  return {
//    link: function() {
//      $timeout(function() {
//        container = document.getElementsByClassName('pac-container');
//        // disable ionic data tab
//        angular.element(container).attr('data-tap-disabled', 'true');
//        // leave input field if google-address-entry is selected
//        angular.element(container).on("click", function(){
//            document.getElementById('type-selector').blur();
//        });
//
//      },500);
//
//    }
//  };
//});


// login and sign up controller
myApp.controller("LoginCtrl", function ($scope, MasterDataService, $cordovaToast) {

    console.log(MasterDataService.getLoggedInUser().email);
    if (MasterDataService.getLoggedInUser().email) {
        window.location = '#/home';
    }

    // initialise a model object to bind input form
    $scope.model = {};

    $scope.login = function () {
        var login = MasterDataService.authenticateUser($scope.model.email, $scope.model.password);
        if (login) {
            window.location = '#/home';
        } else {
            console.log('Opps! Wrong email and/or password!');
            $cordovaToast.show('Opps! Wrong email and/or password!', 'short', 'bottom');
        }
    };

    $scope.signup = function () {
        if (!$scope.model.newEmail || !$scope.model.name || !$scope.model.newPW || !$scope.model.newCfmPW) {
            console.log('Please complete all the fields');
            $cordovaToast.show('Please complete all the fields', 'short', 'bottom');
            return;
        }
        if (!validateEmail($scope.model.newEmail)) {
            console.log('Invalid email!');
            $cordovaToast.show('Invalid email!', 'short', 'bottom');
            return;
        }
        if ($scope.model.newPW.length < 6) {
            console.log('Password need a minimum length of 6');
            $cordovaToast.show('Password need a minimum length of 6', 'short', 'bottom');
            return;
        }
        if ($scope.model.newPW != $scope.model.newCfmPW) {
            console.log('Passwords do not match');
            $cordovaToast.show('Passwords do not match', 'short', 'bottom');
            return;
        }
        if (MasterDataService.getUser($scope.model.newEmail)) {
            console.log('Account exists');
            $cordovaToast.show('Account exists', 'short', 'bottom');
            return;
        }

        var userObj = {
            "email": $scope.model.newEmail,
            "password": $scope.model.newPW,
            "points": 0,
            "name": $scope.model.name,
            "punctual": 0,
            "penalty": 0
        };

        MasterDataService.addNewUser(userObj);

        var createStatus = "";
        setTimeout(function () {
            createStatus = MasterDataService.getCreateStatus();
            console.log(createStatus);
            if (createStatus == "success") {
//                window.location = '#/login';
                $cordovaToast.show('Account created!', 'short', 'bottom').then(function (success) {
                    window.location = '#/login';
                }, function (error) {
                    console.log("The toast was not shown due to " + error);
                });
            } else {
                $cordovaToast.show('Sorry, an error occurred!', 'long', 'bottom');
            }
        }, 3000);
    };

    function validateEmail(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
});

myApp.controller("AddFriendCtrl", function ($scope, MasterDataService, $cordovaToast) {
    // initialise a model object to bind input form
    $scope.model = {};

    $scope.addFriend = function () {
        console.log(MasterDataService.getUser($scope.model.friendEmail));
        if (!$scope.model.friendEmail) {
            console.log("Please enter your friend's email");
            $cordovaToast.show("Please enter your friend's email", 'short', 'center');
            return;
        }
        if (MasterDataService.getLoggedInUser().email == $scope.model.friendEmail) {
            console.log("Isn't that your email?");
            $cordovaToast.show("Isn't that your email?", 'short', 'center');
            return;
        }
        if (!MasterDataService.getUser($scope.model.friendEmail)) {
            console.log("Opps! Account don't exists");
            $cordovaToast.show("Opps! Account don't exists", 'short', 'center');
            return;
        }
        // add in database
        MasterDataService.addFriend($scope.model.friendEmail);

        $cordovaToast.show('Friend added!', 'short', 'bottom').then(function (success) {
            window.location = '#/home';
        }, function (error) {
            console.log("The toast was not shown due to " + error);
        });
    };
});

myApp.controller("AddEventCtrl", function ($scope, MasterDataService, EventService, RankingService, $ionicModal, $cordovaToast) {
    // initialise a model object to bind input form
    $scope.model = {};
    
    // initialise google place
    $scope.gPlace;

    // current user
    $scope.loggedInUser = MasterDataService.getLoggedInUser();
    $scope.userAvatar = RankingService.getAvatar($scope.loggedInUser.points);
    $scope.userRank = RankingService.getRank($scope.loggedInUser.points);

    $scope.addedMembersList = [$scope.loggedInUser];

    // get all the friends of this user
    $scope.friendsList = [];

    // retrieve all the friends object
    var friendsEmailList = MasterDataService.getFriends();
    for (var i = 0; i < friendsEmailList.length; i++) {
        var friendObj = MasterDataService.getUser(friendsEmailList[i]);
        $scope.friendsList.push(friendObj);
    }

    // sort base on points
    $scope.friendsList.sort();

    // pop up dialog
    $ionicModal.fromTemplateUrl('add-members.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (addMembersModal) {
        $scope.addMembersModal = addMembersModal;
    });
    $scope.openModal = function () {
        $scope.addMembersModal.show();
    };
    $scope.closeModal = function () {
        $scope.addMembersModal.hide();
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.addMembersModal.remove();
    });

    // temporary list in popup
    $scope.tempMemberList = [];
    $scope.addMember = function (member) {
        var index = $scope.tempMemberList.indexOf(member);
        // if exist in list, remove
        if (index > -1) {
            $scope.tempMemberList.splice(index, 1);
        } else {
            // add into list
            $scope.tempMemberList.push(member);
        }
        console.log($scope.tempMemberList);
    };

    $scope.confirmAddMembers = function () {
        $scope.addedMembersList = $scope.addedMembersList.concat($scope.tempMemberList);
        console.log($scope.addedMembersList);
        $scope.tempMemberList = [];
        $scope.closeModal();
    };

    $scope.removeMember = function (index) {
        $scope.addedMembersList.splice(index, 1);
        console.log($scope.addedMembersList);
    };

    $scope.cancelAddMember = function () {
        $scope.closeModal();
        $scope.tempMemberList = [];
        unCheckAll();
    };

    $scope.addEvent = function () {
        if (!$scope.model.title || !$scope.model.venue || !$scope.model.date || !$scope.model.start || !$scope.model.end) {
            console.log("Please complete all the fields");
            $cordovaToast.show("Please complete all the fields", 'short', 'center');
            return;
        }
        if ($scope.addedMembersList.length == 1) {
            console.log("Please invite your friends");
            $cordovaToast.show("Please invite your friends", 'short', 'center');
            return;
        }
        
        // get all the email from the member list
        var membersEmail = [];
        for(var i = 0; i < $scope.addedMembersList.length; i++) {
            membersEmail.push($scope.addedMembersList[i].email);
        }
        
        // create the event object
        var eventObj = {
            "id":  $scope.loggedInUser.$id + new Date().getTime(),
            "title": $scope.model.title,
            "venue": $scope.model.venue,
            "startTime": Date.parse($scope.model.date + " " + $scope.model.start),
            "endTime": Date.parse($scope.model.date + " " + $scope.model.end),
            "attendees": membersEmail
        };
        
        console.log(eventObj.id);
        MasterDataService.addFriend(eventObj.id);
//        EventService.addEvent(eventObj);
        console.log(eventObj);
    };
    
    // helper class -----------------------------------
    $scope.getRankName = function (points) {
        return RankingService.getRank(points);
    };

    $scope.getAvatar = function (points) {
        return RankingService.getAvatar(points);
    };

    // clear radio btns
    function unCheckAll() {
        // Get all of the inputs
        var inputs = document.getElementsByTagName("input");

        // for each input in the form, check if it is a checkbox
        for (var i = 0; i < inputs.length; i++) {
            if (inputs[i].type == "checkbox") {
                inputs[i].checked = false;
            }
        }
    }
    ;
    // end helper class -----------------------------------
});

myApp.controller("RankingCtrl", function ($scope, MasterDataService, RankingService) {
    $scope.loggedInUser = MasterDataService.getLoggedInUser();

    // get all the friends of this user
    $scope.friendsList = [MasterDataService.getLoggedInUser()];
    $scope.rankList = [];

    // retrieve all the friends object
    var friendsEmailList = MasterDataService.getFriends();
    for (var i = 0; i < friendsEmailList.length; i++) {
        var friendObj = MasterDataService.getUser(friendsEmailList[i]);
        $scope.friendsList.push(friendObj);
    }

    // sort base on points
    $scope.friendsList.sort(comparePoints);

    // settle ranking and avartar
    var rankCount = 1;

    for (var i = 0; i < $scope.friendsList.length; i++) {

        $scope.rankList.push(rankCount);
        if (i != $scope.friendsList.length - 1) {
            if ($scope.friendsList[i].points != $scope.friendsList[i + 1].points) {
                rankCount += 1;
            }
        }
    }

    // helper class -----------------------------------
    $scope.getRankName = function (points) {
        return RankingService.getRank(points);
    };

    $scope.getAvatar = function (points) {
        return RankingService.getAvatar(points);
    };
    // end helper class -----------------------------------

});


myApp.controller('EventIndexCtrl', function ($scope, EventService, MasterDataService) {
    console.log(MasterDataService.getLoggedInUser());

    // get events from service
//    $scope.events = EventService.all();



    $scope.logout = function () {
        MasterDataService.logout();
//        window.location = '#/login';
    };
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
//    $scope.event = EventService.get($stateParams.eventId);
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

function comparePoints(a, b) {
    if (a.points > b.points) {
        return -1;
    } else if (a.points < b.points) {
        return 1;
    } else {
        if (a.name < b.name) {
            return -1;
        } else if (a.name > b.name) {
            return 1;
        } else {
            return 0;
        }
    }
}
;

        