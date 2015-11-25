'use strict';

angular.module('<%=angularAppName%>')
    .config(function (paginationConfig) {
        paginationConfig.itemsPerPage = 20;
        paginationConfig.maxSize = 5;
        paginationConfig.boundaryLinks = true;
        paginationConfig.firstText = '«';
        paginationConfig.previousText = '‹';
        paginationConfig.nextText = '›';
        paginationConfig.lastText = '»';
    });
