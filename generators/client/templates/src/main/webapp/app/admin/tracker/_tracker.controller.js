(function () {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('<%=jhiPrefixCapitalized%>TrackerController', <%=jhiPrefixCapitalized%>TrackerController);

    <%=jhiPrefixCapitalized%>TrackerController.$inject = ['$cookies', '$http', '<%=jhiPrefixCapitalized%>TrackerService'];

    function <%=jhiPrefixCapitalized%>TrackerController ($cookies, $http, <%=jhiPrefixCapitalized%>TrackerService) {
        // This controller uses a Websocket connection to receive user activities in real-time.
        var vm = this;

        vm.activities = [];

        <%=jhiPrefixCapitalized%>TrackerService.receive().then(null, null, function(activity) {
            showActivity(activity);
        });

        function showActivity(activity) {
            var existingActivity = false;
            for (var index = 0; index < vm.activities.length; index++) {
                if(vm.activities[index].sessionId === activity.sessionId) {
                    existingActivity = true;
                    if (activity.page === 'logout') {
                        vm.activities.splice(index, 1);
                    } else {
                        vm.activities[index] = activity;
                    }
                }
            }
            if (!existingActivity && (activity.page !== 'logout')) {
                vm.activities.push(activity);
            }
        }

    }
})();
