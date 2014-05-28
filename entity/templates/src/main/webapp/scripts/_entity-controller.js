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
            $scope.<%= entityInstance %> = <%= entityClass %>.get(id);
            $('#save<%= entityClass %>Modal').modal('show');
        };

        $scope.delete = function (id) {
            <%= entityClass %>.one(id).delete()
                .then(function () {
                    $scope.<%= entityInstance %>s = <%= entityClass %>.query();
                });
        };

        $scope.clear = function () {
            $scope.<%= entityInstance %> = {id: null, sampleTextAttribute: null, sampleDateAttribute: null};
        };
    }]);
