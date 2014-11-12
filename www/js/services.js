var myApp = angular.module('starter.services', ['firebase']);

myApp.factory('MasterDataService', function ($firebase) {
    var firebaseRef = new Firebase("https://smu-pop.firebaseio.com/users");
    var sync = $firebase(firebaseRef);
    var allUsersArray = sync.$asArray();

    // store the user logged in
    var loggedInUser = JSON.parse(window.localStorage['userSession'] || '{}');

    // create user success?
    var createNewUserSuccess = "";

    // methods for getting data
    return {
        allUsers: function () {
            return allUsersArray;
        },
        authenticateUser: function (email, pw) {
            for (var i = 0; i < allUsersArray.length; i++) {
                var userObj = allUsersArray[i];

                if (email === userObj.email) {
                    if (pw === userObj.password) {
                        console.log("success");
                        loggedInUser = userObj;
                        window.localStorage['userSession'] = JSON.stringify(loggedInUser);
                        return true;
                    }
                }

            }
            console.log("login failed");
            return false;
        },
        logout: function () {
            window.localStorage['userSession'] = '{}';
            loggedInUser = {};
            console.log("log out");
            window.location = '#/login';
        },
        getLoggedInUser: function () {
            return loggedInUser;
        },
        getUser: function (email) {
            for (var i = 0; i < allUsersArray.length; i++) {
                var userObj = allUsersArray[i];
                // account exist
                if (email === userObj.email) {
                    return userObj;
                }
            }
            return {};
        },
        addNewUser: function (userObj) {
            createNewUserSuccess = "pending";

            sync.$push(userObj).then(function () {
                createNewUserSuccess = "success";
            }, function () {
                createNewUserSuccess = "fail";
            });
        },
        getCreateStatus: function () {
            return createNewUserSuccess;
        },
        resetCreateStatus: function () {
            createNewUserSuccess = "";
        },
        addFriend: function (email) {
            console.log(loggedInUser.$id);
            console.log(allUsersArray.indexOf(loggedInUser));
            if (loggedInUser.friends) {
                loggedInUser.friends.push(email);
            } else {
                loggedInUser.friends = [email];
            }
            allUsersArray.$save(loggedInUser);
        },
        getFriends: function () {
            if (loggedInUser.friends) {
                return loggedInUser.friends;
            }
            return [];
        },
        getEvents: function () {
            if (loggedInUser.events) {
                return loggedInUser.events;
            }
            return [];
        },
        addEvent: function (member, event) {
            if (member.events) {
                member.events.push(event);
            } else {
                member.events = [event];
            }
            allUsersArray.$save(member);
        }
    };
});

myApp.factory('RankingService', function () {
    return {
        getAvatar: function (points) {
            if (points <= -50) {
                return "img/Forever-Late.png";
            }
            if (points <= -30) {
                return "img/Kena-Marked.png";
            }
            if (points <= -10) {
                return "img/The Late.png";
            }
            if (points >= 70) {
                return "img/Supreme Punctual Rajesh.png";
            }
            if (points >= 35) {
                return "img/Always-early Ninja.png";
            }
            if (points >= 10) {
                return "img/Just-in-time.png";
            }
            return "img/The Rookie.png";
        },
        getRank: function (points) {
            if (points <= -50) {
                return "Forever-Late Bean";
            }
            if (points <= -30) {
                return "Kena-Marked Bean";
            }
            if (points <= -10) {
                return "The Late Bean";
            }
            if (points >= 70) {
                return "Supreme Punctual Rajesh";
            }
            if (points >= 35) {
                return "Always-early Ninja Bean";
            }
            if (points >= 10) {
                return "Just-in-time Bean";
            }
            return "The Rookie Bean";
        }
    };
});


myApp.factory('EventService', function ($firebase) {

    // Might use a resource here that returns a JSON array

    // Some fake testing data
//    var events = [
//        {id: 0, title: 'Mobile Pervasive Meeting', description: 'Meet up and develop the next cool idea!', date: '24 November 2014', timeStart: '1230', timeEnd: '1545', venue: 'SIS GSR 2.4', penalty: 'Treat kopi', owner: 'Khiew Shi Kai', attendees: ['Izzuddin', 'Brindha', 'Cruz']},
//        {id: 1, title: 'Para Para Dance Meeting', description: 'Time to dance, dance, dance.', date: '25 November 2014', timeStart: '1230', timeEnd: '1545', venue: 'SIS GSR 2.4', penalty: 'Treat beer', owner: 'Khiew Shi Kai', attendees: ['Cruz']},
//        {id: 2, title: 'Super Secret Stuff', description: 'Discuss behind closed doors.', date: '26 November 2014', timeStart: '1230', timeEnd: '1545', venue: 'SIS GSR 2.4', penalty: 'Treat kopi', owner: 'Khiew Shi Kai', attendees: ['Izzuddin', 'Cruz']},
//        {id: 3, title: 'Food Food Food', description: 'Grab an awesome meal together!', date: '27 November 2014', timeStart: '1230', timeEnd: '1545', venue: 'SIS GSR 2.4', penalty: 'Treat Meal', owner: 'Khiew Shi Kai', attendees: ['Izzuddin']}
//    ];

    var firebaseRef = new Firebase("https://smu-pop.firebaseio.com/events");
    var sync = $firebase(firebaseRef);
    var allEventsArray = sync.$asArray();

    return {
        getAllEvents: function () {
            return allEventsArray;
        },
        getEvent: function (eventId) {
            // Simple index lookup
            for (var i = 0; i < allEventsArray.length; i++) {
                var eventObj = allEventsArray[i];
                // account exist
                if (eventId === eventObj.id) {
                    return eventObj;
                }
            }
            return {};
        },
        addEvent: function (eventObj) {
            sync.$push(eventObj);
        }
    };
});

myApp.factory('ProfileService', function () {
    // Might use a resource here that returns a JSON array

    // Some fake testing data
    var profiles = [
        {id: 0, title: 'Cruz', description: 'Punctual King'},
        {id: 1, title: 'Brindha', description: 'Let it go!'},
        {id: 2, title: 'Shi Kai', description: 'Silent is gold'},
        {id: 3, title: 'Izzuddin', description: 'Love is so fluffy'}
    ];

    return {
        all: function () {
            return profiles;
        },
        get: function (profileId) {
            // Simple index lookup
            return profiles[profileId];
        }
    };
});
