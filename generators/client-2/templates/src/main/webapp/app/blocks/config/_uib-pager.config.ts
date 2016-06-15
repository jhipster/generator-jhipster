PagerConfig.$inject = ['uibPagerConfig', 'paginationConstants'];

export function PagerConfig(uibPagerConfig, paginationConstants) {
    uibPagerConfig.itemsPerPage = paginationConstants.itemsPerPage;
    uibPagerConfig.previousText = '«';
    uibPagerConfig.nextText = '»';
}
