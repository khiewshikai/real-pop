var myApp = angular.module('starter.services', ['firebase']);

myApp.factory('MasterDataService', function ($firebase) {
    var firebaseRef = new Firebase("https://smu-pop.firebaseio.com/users");
    var sync = $firebase(firebaseRef);
    var allUsersArray = sync.$asArray();

    console.log("Master Data loaded");
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
        addFriend: function (user, email) {
            console.log(email);
            console.log(user.$id);
            console.log(allUsersArray.indexOf(user));
            if (user.friends) {
                user.friends.push(email);
            } else {
                user.friends = [email];
            }
            allUsersArray.$save(user);
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
        },
        removeEvent: function (event) {
            for (var i = 0; i < loggedInUser.events.length; i++) {
                if (loggedInUser.events[i] == event.id) {
                    loggedInUser.events.splice(i, 1);
                }
            }
            allUsersArray.$save(loggedInUser);
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

myApp.factory('PenaltyService', function () {
    var penaltyList = ['treat', 'pay up', 'perform', 'GSR booker', 'custom'];

    return {
        getPenaltyList: function () {
            return penaltyList;
        },
        getDesc: function (name) {
            var desc = "";
            switch (name) {
                case 'treat':
                    desc = "this is treat desc";
                    break;
                case 'pay up':
                    desc = "this is pay up desc";
                    break;
                case 'perform':
                    desc = "this is perform desc";
                    break;
                case 'GSR booker':
                    desc = "this is GSR booker desc";
                    break;
                default:
                    desc = "";
                    break;
            }
            return desc;
        },
        getPenImg: function (name) {
            var url = "";
            switch (name) {
                case 'treat':
                    url = "img/treat penalty-02-01.png";
                    break;
                case 'pay up':
                    url = "img/treat penalty-02-02.png";
                    break;
                case 'perform':
                    url = "img/treat penalty-02-03.png";
                    break;
                case 'GSR booker':
                    url = "img/treat penalty-02-04.png";
                    break;
                default:
                    url = "img/treat penalty-02-05.png";
                    break;
            }
            return url;
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
        },
        removeAttendee: function (eventId, userId) {
            var eventObj = {};

            for (var i = 0; i < allEventsArray.length; i++) {
                eventObj = allEventsArray[i];
                // account exist
                if (eventId === eventObj.id) {
                    // loop through the attendees of this event
                    for (var j = 0; j < eventObj.attendees.length; j++) {
                        var attendeeObj = eventObj.attendees[j];
                        if (attendeeObj.email == userId) {
                            console.log("remove attendee");
                            eventObj.attendees.splice(j, 1);
                        }
                    }
                }
            }
            allEventsArray.$save(eventObj);
        },
        updateAttendance: function (eventId, userId, status) {
            console.log("update status");
            var eventObj = {};

            for (var i = 0; i < allEventsArray.length; i++) {
                eventObj = allEventsArray[i];
                // account exist
                if (eventId === eventObj.id) {
                    // loop through the attendees of this event
                    for (var j = 0; j < eventObj.attendees.length; j++) {
                        var attendeeObj = eventObj.attendees[j];
                        if (attendeeObj.email == userId) {
                            attendeeObj.status = 'g';
                        }
                    }
                }
            }
            allEventsArray.$save(eventObj);
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
