'use strict';

<%= angularAppName %>.controller('<%= entityClass %>Controller', ['$scope', 'resolved<%= entityClass %>', '<%= entityClass %>',
    function ($scope, resolved<%= entityClass %>, <%= entityClass %>) {

        $scope.<%= entityInstance %>s = resolved<%= entityClass %>;

        $scope.create = function () {
            <%= entityClass %>.save($scope.<%= entityInstance %>,
                function () {
                    $scope.<%= entityInstance %>s = <%= entityClass %>.query();
                    $('#save<%= entityClass %>Modal').modal('hide');
                    $scope.clear();
                });
        };

        $scope.update = function (id) {
            $scope.<%= entityInstance %> = <%= entityClass %>.get({id: id});
            $('#save<%= entityClass %>Modal').modal('show');
        };

        $scope.delete = function (id) {
            <%= entityClass %>.delete({id: id},
                function () {
                    $scope.<%= entityInstance %>s = <%= entityClass %>.query();
                });
        };

        $scope.clear = function () {
            $scope.<%= entityInstance %> = {id: "", sampleTextAttribute: "", sampleDateAttribute: ""};
        };
    }]);
