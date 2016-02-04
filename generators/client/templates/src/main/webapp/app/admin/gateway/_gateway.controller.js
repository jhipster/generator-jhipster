'use strict';

angular.module('<%=angularAppName%>')
    .controller('GatewayController', function ($scope, $filter, $interval, GatewayRoutes) {
        $scope.refresh = function () {
            $scope.updatingRoutes = true;
            GatewayRoutes.query(function(result) {
                $scope.gatewayRoutes = result;
                $scope.updatingRoutes = false;
            });
        };

        $scope.refresh();

        // refresh the list of services every 2 seconds
        $interval(function() {
            $scope.refresh();
        }.bind(this), 2000);
    });
