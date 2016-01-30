angular.module('<%=angularAppName%>')
    .controller('TrackerController', function ($scope<% if (authenticationType == 'oauth2') { %>, AuthServerProvider<% } %>, $cookies, $http, Tracker) {
        // This controller uses a Websocket connection to receive user activities in real-time.

        $scope.activities = [];
        Tracker.receive().then(null, null, function(activity) {
            showActivity(activity);
        });

        function showActivity(activity) {
            var existingActivity = false;
            for (var index = 0; index < $scope.activities.length; index++) {
                if($scope.activities[index].sessionId == activity.sessionId) {
                    existingActivity = true;
                    if (activity.page == 'logout') {
                        $scope.activities.splice(index, 1);
                    } else {
                        $scope.activities[index] = activity;
                    }
                }
            }
            if (!existingActivity && (activity.page != 'logout')) {
                $scope.activities.push(activity);
            }
        };
    });
