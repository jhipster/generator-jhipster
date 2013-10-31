'use strict';

/* Services */

<%= baseName %>App.factory('Account', function($resource){
        return $resource('app/rest/account', {}, {
        });
    });
