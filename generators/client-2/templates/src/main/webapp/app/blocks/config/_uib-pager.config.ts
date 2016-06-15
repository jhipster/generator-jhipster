PagerConfig.$inject = ['uibPagerConfig', 'paginationConstants'];

function PagerConfig(uibPagerConfig, paginationConstants) {
    uibPagerConfig.itemsPerPage = paginationConstants.itemsPerPage;
    uibPagerConfig.previousText = '«';
    uibPagerConfig.nextText = '»';
}

export default PagerConfig;
