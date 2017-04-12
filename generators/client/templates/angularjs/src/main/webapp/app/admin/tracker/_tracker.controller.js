<%#
 Copyright 2013-2017 the original author or authors.

 This file is part of the JHipster project, see https://jhipster.github.io/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
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
