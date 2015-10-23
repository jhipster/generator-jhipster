(function () {
    'use strict';

    angular.module('<%=angularAppName%>.<%= entityClass %>', []);
    angular.module('<%=angularAppName%>').requires.push('<%=angularAppName%>.<%= entityClass %>');

})();
