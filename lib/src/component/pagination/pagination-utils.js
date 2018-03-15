"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUrlParameter = function (name, search) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};
exports.getSortState = function (location, itemsPerPage) {
    var pageParam = exports.getUrlParameter('page', location.search);
    var sortParam = exports.getUrlParameter('sort', location.search);
    var sort = 'id';
    var order = 'asc';
    var activePage = 1;
    if (pageParam !== '' && !isNaN(parseInt(pageParam, 10))) {
        activePage = parseInt(pageParam, 10);
    }
    if (sortParam !== '') {
        sort = sortParam.split(',')[0];
        order = sortParam.split(',')[1];
    }
    return { itemsPerPage: itemsPerPage, sort: sort, order: order, activePage: activePage };
};
exports.getPaginationItemsNumber = function (totalItems, itemsPerPage) {
    var division = Math.floor(totalItems / itemsPerPage);
    var modulo = totalItems % itemsPerPage;
    return division + (modulo !== 0 ? 1 : 0);
};
//# sourceMappingURL=pagination-utils.js.map