'use strict';

angular.module('jhipsterApp')
    .factory('Register', function ($resource) {
        return $resource('api/register', {}, {
        });
    });


