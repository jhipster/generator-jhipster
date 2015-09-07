'use strict';

angular.module('<%=angularAppName%>')
    .controller('<%= entityClass %>DetailController', function (alertService, $location, $scope, $stateParams<% for (idx in differentTypes) { %>, <%= differentTypes[idx] %><% } %>) {
        
        
        if($location.path() === "/<%= entityInstance %>/create"){
            $scope.create = true;
        }
        
        if($location.path().indexOf("/<%= entityInstance %>/edit/") != -1){
            $scope.edit = true;
        }
        if($location.path().indexOf("/<%= entityInstance %>/detail/") != -1){
            $scope.view = true;
        }   

        $scope.<%= entityInstance %> = {};
        if($scope.view || $scope.edit){            
            $scope.load = function (id) {
                <%= entityClass %>.get({id: id}, function(result) {
                  $scope.<%= entityInstance %> = result;
                });
            };
            $scope.load($stateParams.id);
        }

        $scope.save = function(){
            alertService.add("success", "Success: It works! ", 3000);
        }    
    });
