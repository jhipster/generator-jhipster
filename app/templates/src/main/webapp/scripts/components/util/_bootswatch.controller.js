'use strict';

angular.module('<%=angularAppName%>')
    .controller('BootswatchController', function ($scope, BootSwatchService) {
        /*Get the list of availabel bootswatch themes*/
        BootSwatchService.get().then(function(themes) {
            $scope.themes = themes;
            $scope.themes.unshift({name:'Default',css:''});
        });
    });
