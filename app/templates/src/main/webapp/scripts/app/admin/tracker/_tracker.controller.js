angular.module('<%=angularAppName%>')
    .controller('TrackerController', function ($scope<% if (authenticationType == 'token') { %>, AuthServerProvider<% } %>) {
        // This controller uses a Websocket connection to receive user activities in real-time.

        $scope.activities = [];
        var stompClient = null;
        var socket = new SockJS('/websocket/tracker');
        stompClient = Stomp.over(socket);
        stompClient.connect({}, function(frame) {
            stompClient.subscribe('/topic/activity', function(activity){
                showActivity(JSON.parse(activity.body));
            });
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
            $scope.$apply();
        };
    });
