(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .config(function (uibPagerConfig, paginationConstants) {
            uibPagerConfig.itemsPerPage = paginationConstants.itemsPerPage;
            uibPagerConfig.previousText = '«';
            uibPagerConfig.nextText = '»';
        });
})();
