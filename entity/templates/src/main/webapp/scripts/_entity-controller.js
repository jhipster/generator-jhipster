'use strict';

<%= angularAppName %>.controller('<%= entityClass %>Controller', ['$scope', 'resolved<%= entityClass %>', '<%= entityClass %>',
    function ($scope, resolved<%= entityClass %>, <%= entityClass %>) {
        
        $scope.<%= entityInstance %>s = resolved<%= entityClass %>;
    }]);
