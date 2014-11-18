var myApp = angular.module('starter.controllers', ['firebase', 'angular-datepicker']);

// directive for google Place
myApp.directive('googleplace', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, model) {
            var options = {
                types: [],
                componentRestrictions: {}
            };
            scope.gPlace = new google.maps.places.Autocomplete(element[0], options);

            google.maps.event.addListener(scope.gPlace, 'place_changed', function () {
                scope.$apply(function () {
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
        if (MasterDataService.getUser($scope.model.newEmail).email) {
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
    // current user
    $scope.loggedInUser = MasterDataService.getLoggedInUser();

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
        MasterDataService.addFriend($scope.loggedInUser, $scope.model.friendEmail);

        // add friend at the other side
        var friendObj = MasterDataService.getUser($scope.model.friendEmail);
        MasterDataService.addFriend(friendObj, $scope.loggedInUser.email);

        $cordovaToast.show('Friend added!', 'short', 'bottom').then(function (success) {
            setTimeout(function () {
                window.location = '#/home';
            }, 1500);
        }, function (error) {
            console.log("The toast was not shown due to " + error);
        });
    };
});

myApp.controller("AddEventCtrl", function ($scope, MasterDataService, EventService, RankingService, $ionicModal, $cordovaToast, PenaltyService, $http) {
    // initialise a model object to bind input form
    $scope.model = {};

    // initialise google place
    $scope.gPlace;

    // current user
    $scope.loggedInUser = MasterDataService.getLoggedInUser();
    $scope.userAvatar = RankingService.getAvatar($scope.loggedInUser.points);
    $scope.userRank = RankingService.getRank($scope.loggedInUser.points);

    $scope.addedMembersList = [$scope.loggedInUser];

    $scope.penaltyList = PenaltyService.getPenaltyList();

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
        console.log($scope.model.penalty);

        if (!$scope.model.title || !$scope.model.venue || !$scope.model.date || !$scope.model.start || !$scope.model.end || !$scope.model.penalty) {
            console.log("Please complete all the fields");
            $cordovaToast.show("Please complete all the fields", 'short', 'center');
            return;
        }

        var currentDate = new Date();
        var startTime = Date.parse($scope.model.date + " " + $scope.model.start);
        var endTime = Date.parse($scope.model.date + " " + $scope.model.end);

        if (startTime < currentDate) {
            console.log("You cannot create an event in the past!");
            $cordovaToast.show("You cannot create an event in the past!", 'short', 'center');
            return;
        }

        if (endTime < startTime) {
            console.log("Your event should not end before it starts!");
            $cordovaToast.show("Your event should not end before it starts", 'short', 'center');
            return;
        }

        if ($scope.addedMembersList.length == 1) {
            console.log("Please invite your friends");
            $cordovaToast.show("Please invite your friends", 'short', 'center');
            return;
        }

        // get all the email from the member list
        var attendeesList = [];
        for (var i = 0; i < $scope.addedMembersList.length; i++) {
            var mObj = {
                "email": $scope.addedMembersList[i].email,
                "status": "n"
            }
            attendeesList.push(mObj);
        }

        console.log($scope.model.venue);
        $http.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + $scope.model.venue).then(function (resp) {
            console.log('Success', resp);
            var venueLat = resp.data.results[0].geometry.location.lat;
            var venueLng = resp.data.results[0].geometry.location.lng;
            console.log("Venue Lat: " + venueLat);
            console.log("Venue Lng: " + venueLng);
            $scope.venueLat = venueLat;
            $scope.venueLng = venueLng;

            var penaltyName = $scope.model.penalty;
            if ($scope.model.penaltyName) {
                penaltyName = $scope.model.penaltyName;
            }

            var penaltyRules = PenaltyService.getDesc(penaltyName);
            if ($scope.model.penaltyRules) {
                penaltyRules = $scope.model.penaltyRules;
            }

            // create the event object
            var eventObj = {
                "id": $scope.loggedInUser.$id + new Date().getTime(),
                "title": $scope.model.title,
                "venue": $scope.model.venue,
                "venueLat": $scope.venueLat,
                "venueLng": $scope.venueLng,
                "startTime": Date.parse($scope.model.date + " " + $scope.model.start),
                "endTime": Date.parse($scope.model.date + " " + $scope.model.end),
                "attendees": attendeesList,
                "penaltyName": penaltyName,
                "penaltyRules": penaltyRules
            };

            // add event to all members
            for (var i = 0; i < $scope.addedMembersList.length; i++) {
                MasterDataService.addEvent($scope.addedMembersList[i], eventObj.id);
            }

            EventService.addEvent(eventObj);

            // For JSON responses, resp.data contains the result
        }, function (err) {
            console.error('ERR', err);
            //Add Toast

            // err.status will contain the status code
        })

        $cordovaToast.show('Event added!', 'short', 'bottom').then(function (success) {
            setTimeout(function () {
                window.location = '#/home';
            }, 1500);
        }, function (error) {
            console.log("The toast was not shown due to " + error);
        });
    };

    // helper class -----------------------------------
    $scope.getDesc = function (name) {
        return PenaltyService.getDesc(name);
    };

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


myApp.controller('HomeCtrl', function ($scope, EventService, MasterDataService, $q, $timeout, $ionicLoading) {
    console.log(MasterDataService.getLoggedInUser());

    $scope.loggedInUser = MasterDataService.getLoggedInUser();

    $scope.eventsList = [];

    var currentDate = Date.parse(new Date());
    var bufferTime = 900000;
//    $scope.currentEvent = {};

    /*ORIGINAL CODE
    // get the events of this user
    var eventsIdList = MasterDataService.getEvents();

    for (var i = 0; i < eventsIdList.length; i++) {
        var eventObj = EventService.getEvent(eventsIdList[i]);
        console.log(eventObj);
        // past event
        if (eventObj.endTime < currentDate) {
            console.log('past event');
//            break;
        } else {
            console.log(currentDate);
            console.log(eventObj.startTime - 900000);
            
            // see if there is an current event
            if (currentDate >= eventObj.startTime - 900000 && currentDate < eventObj.endTime) {
                console.log('current event');
                $scope.currentEvent = eventObj;
                console.log($scope.currentEvent);
            } else {
                $scope.eventsList.push(eventObj);
            }
        }

    }
    console.log($scope.currentEvent);
    console.log($scope.eventsList);
    // sort by date
    $scope.eventsList.sort(compareDate);
    */

    //FIX ASYNC
    var allEvents = EventService.getAllEvents();
    console.log(allEvents);
    //var test = EventService.allEvents;
    //console.log(test[0]);

    // get the events of this user
    var retrieveUserEvents = function(){
        var retrieveList = [];
        var deferred = $q.defer();
        var eventsIdList = MasterDataService.getEvents();
        for (var i = 0; i < eventsIdList.length; i++) {
            var eventObj = EventService.getEvent(eventsIdList[i]);
            retrieveList.push(eventObj);

        }
        console.log(eventsIdList);
        $ionicLoading.show({
            template: 'Loading...'
        });
        $scope.listReady = false;
        deferred.resolve(eventsIdList);
        return deferred.promise;
    }
    $timeout(function(){
    retrieveUserEvents().then(function(data){
        console.log(data);
        for(var j = 0; j < data.length; j++){
            for (var i = 0; i < allEvents.length; i++) {
                var eventObj = allEvents[i];
                // account exist
                if (data[j] === eventObj.id) {
                    //$scope.eventsList.push(eventObj);
                    if (eventObj.endTime < currentDate) {
                        console.log('past event');
//                      break;
                    } else {
                        console.log(currentDate);
                        console.log(eventObj.startTime - 900000);
            
                        // see if there is an current event
                         if (currentDate >= eventObj.startTime - 900000 && currentDate < eventObj.endTime) {
                            console.log('current event');
                            $scope.currentEvent = eventObj;
                            console.log($scope.currentEvent);
                        } else {
                            $scope.eventsList.push(eventObj);
                        }
                    }
                }
            
                console.log(eventObj);
            }  
        }
      
        $scope.eventsList.sort(compareDate);
        console.log($scope.eventsList);

        $ionicLoading.hide();
        $scope.listReady = true;
    });
        }, 1200);



    // count the number of attendees who arrived
    $scope.countArrived = function (attendeesList) {
        var count = 0;
        for (var i = 0; i < attendeesList.length; i++) {
            var attendeeObj = attendeesList[i];
            if (attendeeObj.status == 'g') {
                count += 1;
            }
        }
        return count;
    };

    // view event details
    $scope.viewEvent = function (url) {
        window.location = url;
    };


    $scope.logout = function () {
        MasterDataService.logout();
//        window.location = '#/login';
    };

    
    // have events, watch first event location
    $scope.refreshLocation = function() {
        if ($scope.currentEvent) {
            console.log("Have current event");
            var currentDate = Date.parse(new Date());
            
            var bufferTime = 0;
            // check the event time
            if (currentDate >= $scope.currentEvent.startTime - 500000 && currentDate <= $scope.currentEvent.startTime + bufferTime) {
                // see if user has arrived...
                var checkLoc = function () {
                    var deferred = $q.defer();
                    console.log($scope.currentEvent);
                    var arrived = retrieveUserCurrentCoord($scope.currentEvent.venueLat, $scope.currentEvent.venueLng);
                    deferred.resolve(arrived);
                    return deferred.promise;
                };

                if (checkLoc) {
                    EventService.updateAttendance($scope.currentEvent.id, $scope.loggedInUser.email, 'g');
                    MasterDataService.addPunctual();
                }
            } else if (currentDate > $scope.currentEvent.startTime + bufferTime) {
                console.log("Late liao");
                for (var i=0; i<$scope.currentEvent.attendees.length; i++) {
                    var attendeeObj = $scope.currentEvent.attendees[i];
                    if (attendeeObj.status === 'n') {
                        // mark as late
                        EventService.updateAttendance($scope.currentEvent.id, attendeeObj.email, 'r');
                        var member = MasterDataService.getUser(attendeeObj.email);
                        MasterDataService.addPenalty(member);
                    }
                }
            }

        }
    }
    
    //$scope.refreshLocation();
//    var checkLoc = function () {
//        $scope.date = new Date();
//        // have events, watch first event location
//        if ($scope.eventsList.length != 0) {
//            if ($scope.date < $scope.eventsList[0].startTime && $scope.date >= $scope.eventsList[0].startTime + 900000) {
//                var deferred = $q.defer();
//                console.log($scope.eventsList[0]);
//                var arrived = retrieveUserCurrentCoord($scope.eventsList[0].venueLat, $scope.eventsList[0].venueLng);
//                deferred.resolve(arrived);
//                return deferred.promise;
//            }
//            if($scope.date > $scope.eventsList[0].startTime){
//                //EventService.updatePoints($scope.eventsList[0].id);
//                EventService.updateAttendance($scope.eventsList[0].id, $scope.loggedInUser.email, 'g');
//            }
//        }
//    };

    // helper class -----------------------------------
    $scope.convertTime = function (time) {
        var date = new Date(time);
        var dateStr = date.toLocaleTimeString();
        return dateStr;
    };

    $scope.convertDate = function (time) {
        var date = new Date(time);
        var dateStr = date.toDateString();
        return dateStr;
    };

    // end helper class -----------------------------------
});

myApp.controller('EventDetailCtrl', function ($scope, $stateParams, MasterDataService, EventService, RankingService, PenaltyService, $ionicPopup) {
    $scope.loggedInUser = MasterDataService.getLoggedInUser();
    console.log($scope.loggedInUser);

    $scope.event = EventService.getEvent($stateParams.eventId);
    console.log($scope.event);

    $scope.attendeesList = [];

    for (var i = 0; i < $scope.event.attendees.length; i++) {
        var attendeeObj = MasterDataService.getUser($scope.event.attendees[i].email);
        $scope.attendeesList.push(attendeeObj);
    }

    // count the number of attendees who arrived
    $scope.countArrived = function () {
        var count = 0;
        for (var i = 0; i < $scope.event.attendees.length; i++) {
            var attendeeObj = $scope.event.attendees[i];
            if (attendeeObj.status == 'g') {
                count += 1;
            }
        }
        return count;
    };

    // A confirm dialog
    $scope.showConfirm = function (event) {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Leave Event',
            template: 'Are you sure you want to leave this event?'
        });
        confirmPopup.then(function (res) {
            if (res) {
                // confirm leave event
                console.log('You are sure');
                MasterDataService.removeEvent(event);

                EventService.removeAttendee(event.id, $scope.loggedInUser.email);
            } else {
                console.log('You are not sure');
            }
        });
    };

    // helper class -----------------------------------
    $scope.getRankName = function (points) {
        return RankingService.getRank(points);
    };

    $scope.getAvatar = function (points) {
        return RankingService.getAvatar(points);
    };

    $scope.convertTime = function (time) {
        var date = new Date(time);
        var dateStr = date.toLocaleTimeString();
        return dateStr;
    };

    $scope.convertDate = function (time) {
        var date = new Date(time);
        var dateStr = date.toDateString();
        return dateStr;
    };
    
    $scope.getPenImg = function (name) {
        return PenaltyService.getPenImg(name);
    };
    // end helper class -----------------------------------
});

myApp.controller('ProfileIndexCtrl', function ($scope, ProfileService, $ionicModal) {
    $rootScope.loginUser
});

myApp.controller('ProfileDetailCtrl', function ($scope, $stateParams, ProfileService) {

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


// helper classes
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

function compareDate(a, b) {
    if (a.startTime < b.startTime) {
        return -1;
    } else if (a.startTime > b.startTime) {
        return 1;
    } else {
        if (a.endTime > b.endTime) {
            return -1;
        } else if (a.endTime < b.endTime) {
            return 1;
        } else {
            return 0;
        }
    }
}
;

function retrieveUserCurrentCoord(eventX, eventY) {
    var positions = [];

    navigator.geolocation.getCurrentPosition(function (position) {
        var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        positions.push({lat: pos.k, lng: pos.B});
        console.log("lat: " + pos.k + ", lng: " + pos.B);

        return checkCoordDifference(pos.k, pos.B, eventX, eventY);
    });

    //return positions;
}

function checkCoordDifference(userX, userY, eventX, eventY) {
    var arriveLocation = false;

    var firstLatLng = new google.maps.LatLng(userX, userY);
    var secondLatLng = new google.maps.LatLng(eventX, eventY);
    var distance = google.maps.geometry.spherical.computeDistanceBetween(firstLatLng, secondLatLng);
    console.log(distance);

    if (distance <= 100) {
        arriveLocation = true;
    }
    console.log(arriveLocation);
    return arriveLocation;
}
        