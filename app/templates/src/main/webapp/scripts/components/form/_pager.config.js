'use strict';

angular.module('<%=angularAppName%>')
    .config(function (pagerConfig) {
        pagerConfig.itemsPerPage = 20;
        pagerConfig.previousText = '«';
        pagerConfig.nextText = '»';
    });
