'use strict';

<%= angularAppName %>.controller('<%= entityClass %>Controller', ['$scope', 'resolved<%= entityClass %>', '<%= entityClass %>',
    function ($scope, resolved<%= entityClass %>, <%= entityClass %>) {
        
        $scope.<%= entityInstance %>s = resolved<%= entityClass %>;
    }]);

<%= angularAppName %>
    .config(['$routeProvider', '$httpProvider', '$translateProvider',
        function ($routeProvider, $httpProvider, $translateProvider) {
            $routeProvider
                .when('/<%= entityInstance %>', {
                    templateUrl: 'views/<%= entityInstance %>s.html',
                    controller: '<%= entityClass %>Controller',
                    resolve:{
                        resolved<%= entityClass %>:['<%= entityClass %>', function (<%= entityClass %>) {
                            return <%= entityClass %>.get();
                        }]
                    }
                })
        }]);
