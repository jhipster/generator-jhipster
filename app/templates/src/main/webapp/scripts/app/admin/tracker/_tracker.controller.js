(function () {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('TrackerController', controller);

    controller.$inject = [<% if (authenticationType == 'oauth2') { %>
        'AuthServerProvider', <% } %>
        '$cookies',
        '$http',
        'Tracker'
    ];
    /* @ngInject */
    function controller(<% if (authenticationType == 'oauth2') { %> AuthServerProvider,<% } %> $cookies, $http, Tracker){
        // This controller uses a Websocket connection to receive user activities in real-time.

        var vm = this;
        vm.activities = [];
        vm.showActivity = showActivity;

        activate();
        function activate(){
            Tracker.receive().then(null, null, function(activity) {
                vm.showActivity(activity);
            });
        }

        function showActivity(activity) {
            var existingActivity = false;
            for (var index = 0; index < vm.activities.length; index++) {
                if(vm.activities[index].sessionId == activity.sessionId) {
                    existingActivity = true;
                    if (activity.page == 'logout') {
                        vm.activities.splice(index, 1);
                    } else {
                        vm.activities[index] = activity;
                    }
                }
            }
            if (!existingActivity && (activity.page != 'logout')) {
                vm.activities.push(activity);
            }
        };
    }
})();
