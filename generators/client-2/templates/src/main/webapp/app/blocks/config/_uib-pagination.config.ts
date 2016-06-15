PaginationConfig.$inject = ['uibPaginationConfig', 'paginationConstants'];

function PaginationConfig(uibPaginationConfig, paginationConstants) {
    uibPaginationConfig.itemsPerPage = paginationConstants.itemsPerPage;
    uibPaginationConfig.maxSize = 5;
    uibPaginationConfig.boundaryLinks = true;
    uibPaginationConfig.firstText = '«';
    uibPaginationConfig.previousText = '‹';
    uibPaginationConfig.nextText = '›';
    uibPaginationConfig.lastText = '»';
}

export default PaginationConfig;
