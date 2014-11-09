var myApp = angular.module('starter.services', ['firebase']);

myApp.factory('MasterDataService', function ($firebase) {
    var firebaseRef = new Firebase("https://smu-pop.firebaseio.com/users");
    var sync = $firebase(firebaseRef);
    var allUsersArray = sync.$asArray();

    var loggedInUser = {};

    // methods for getting data
    return {
        allUsers: function () {
            return allUsersArray;
        },
        authenticateUser: function (username, pw) {
            for (var i = 0; i < allUsersArray.length; i++) {
                var userObj = allUsersArray[i];
                if (username === userObj.username) {
                    if (pw === userObj.password) {
                        console.log("success");
                        loggedInUser = userObj;
                        return true;
                    }
                }

            }
            console.log("login failed");
            return false;
        },
        getLoggedInUser: function () {
            return loggedInUser;
        }
    };
});


myApp.factory('EventService', function () {

    // Might use a resource here that returns a JSON array

    // Some fake testing data
    var events = [
        {id: 0, title: 'Mobile Pervasive Meeting', description: 'Meet up and develop the next cool idea!', date: '24 November 2014', timeStart: '1230', timeEnd: '1545', venue: 'SIS GSR 2.4', penalty: 'Treat kopi', owner: 'Khiew Shi Kai', attendees: ['Izzuddin', 'Brindha', 'Cruz']},
        {id: 1, title: 'Para Para Dance Meeting', description: 'Time to dance, dance, dance.', date: '25 November 2014', timeStart: '1230', timeEnd: '1545', venue: 'SIS GSR 2.4', penalty: 'Treat beer', owner: 'Khiew Shi Kai', attendees: ['Cruz']},
        {id: 2, title: 'Super Secret Stuff', description: 'Discuss behind closed doors.', date: '26 November 2014', timeStart: '1230', timeEnd: '1545', venue: 'SIS GSR 2.4', penalty: 'Treat kopi', owner: 'Khiew Shi Kai', attendees: ['Izzuddin', 'Cruz']},
        {id: 3, title: 'Food Food Food', description: 'Grab an awesome meal together!', date: '27 November 2014', timeStart: '1230', timeEnd: '1545', venue: 'SIS GSR 2.4', penalty: 'Treat Meal', owner: 'Khiew Shi Kai', attendees: ['Izzuddin']}
    ];


    return {
        all: function () {
            return events;
        },
        get: function (eventId) {
            // Simple index lookup
            return events[eventId];
        }
    };
})

        .factory('ProfileService', function () {
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
