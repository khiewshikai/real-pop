var myApp = angular.module('starter.services', ['firebase']);

myApp.factory('MasterDataService', function ($firebase) {
    var firebaseRef = new Firebase("https://smu-pop.firebaseio.com/users");
    var sync = $firebase(firebaseRef);
    var allUsersArray = sync.$asArray();

//    console.log("Master Data loaded");
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
//                        console.log("success");
                        loggedInUser = userObj;
                        window.localStorage['userSession'] = JSON.stringify(loggedInUser);
                        return true;
                    }
                }

            }
//            console.log("login failed");
            return false;
        },
        logout: function () {
            window.localStorage['userSession'] = '{}';
            loggedInUser = {};
//            console.log("log out");
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
//            console.log(email);
//            console.log(user.$id);
//            console.log(allUsersArray.indexOf(user));
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
//            console.log(loggedInUser.events);
            if (loggedInUser.events) {
                return loggedInUser.events;
            }
            return [];
        },
        addEvent: function (member, event) {
//            console.log(member);
            if (member.events) {
                member.events.push(event);
            } else {
                member.events = [event];
            }
            allUsersArray.$save(member);
//            console.log("Saved");
        },
        removeEvent: function (event) {
            for (var i = 0; i < loggedInUser.events.length; i++) {
                if (loggedInUser.events[i] == event.id) {
                    loggedInUser.events.splice(i, 1);
                }
            }
            allUsersArray.$save(loggedInUser);
        },
        addPunctual: function () {
            loggedInUser.punctual = loggedInUser.punctual + 1;
            loggedInUser.points = loggedInUser.points + 5;
            allUsersArray.$save(loggedInUser);
        }
        ,
        addPenalty: function (member) {
            member.penalty = member.penalty + 1;
            member.points = member.points - 10;
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

myApp.factory('PenaltyService', function () {
    var penaltyList = ['food and drink (treat)', 'pay up', 'perform', 'GSR booker', 'custom'];

    return {
        getPenaltyList: function () {
            return penaltyList;
        },
        getDesc: function (name) {
            var desc = "";
            switch (name) {
                case 'food and drink (treat)':
                    desc = "For coming late for this meeting, you are to treat your teammates to either a drink or meal. That’s right. A drink or meal for every single one of them. *wink*";
                    break;
                case 'pay up':
                    desc = "Got a welfare fund for your group? Nope? Well time to start one then. For coming late, contribute to this fund. $2, $5, or more. Let’s see what your groupmates decide on.";
                    break;
                case 'perform':
                    desc = "Time for some entertainment for your groupmates. Hope you had enough practice in your bathroom because it is time to sing or dance to the latest hit. Groupmates, I am sure you know which song to choose.";
                    break;
                case 'GSR booker':
                    desc = "Bet you are going to have many more meetings with this group. As a penalty for being late, you now have to be the one responsible for all future GSR bookings for this group. You heard me right, so start booking those GSRs!";
                    break;
                default:
                    desc = "Good job deciding on that penalty. Set your own rules on how is should be carried out and remember to impose it on your group member!";
                    break;
            }
            return desc;
        },
        getPenImg: function (name) {
            var url = "";
            switch (name) {
                case 'food and drink (treat)':
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
//                            console.log("remove attendee");
                            eventObj.attendees.splice(j, 1);
                        }
                    }
                }
            }
            allEventsArray.$save(eventObj);
        },
        updateAttendance: function (eventId, userId, status) {
//            console.log("update status");
            var eventObj = {};

            for (var i = 0; i < allEventsArray.length; i++) {
                eventObj = allEventsArray[i];
                // account exist
                if (eventId === eventObj.id) {
                    // loop through the attendees of this event
                    for (var j = 0; j < eventObj.attendees.length; j++) {
                        var attendeeObj = eventObj.attendees[j];
                        if (attendeeObj.email == userId) {
                            attendeeObj.status = status;
                            break;
                        }
                    }
                }
            }
            allEventsArray.$save(eventObj);
        },
        updatePoints: function (eventId) {
//            console.log("update Points");
            var eventObj = {};
            
            for (var i = 0; i < allEventsArray.length; i++) {
                eventObj = allEventsArray[i];
                // account exist
                if (eventId === eventObj.id) {
                    // loop through the attendees of this event
                    for (var j = 0; j < eventObj.attendees.length; j++) {
                        var attendeeObj = eventObj.attendees[j];
                        if (attendeeObj.status === 'g') {
                            attendeeObj.points += 5;
                        }
                        if (attendeeObj.status === 'r') {
                            attendeeObj.points -= 5;
                        }
                    }
                }
            }
            allEventsArray.$save(eventObj);
        }
    };
});

myApp.factory('NewsFeedService', function ($firebase) {
    var firebaseRef = new Firebase("https://smu-pop.firebaseio.com/newsfeed");
    var sync = $firebase(firebaseRef);
    var allNewsArray = sync.$asArray();

    return {
        getAllNews: function () {
            return allNewsArray;
        },
        getNews: function (newsId) {
            // Simple index lookup
            for (var i = 0; i < allNewsArray.length; i++) {
                var newsObj = allNewsArray[i];
                // account exist
                if (newsId === newsObj.id) {
                    return newsObj;
                }
            }
            return {};
        },
        addNews: function (newsObj) {
            sync.$push(newsObj);
        }
    };
});