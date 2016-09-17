import { ITEMS_PER_PAGE } from '../../shared/constants/pagination.constants';

PagerConfig.$inject = ['uibPagerConfig'];

export function PagerConfig(uibPagerConfig) {
    uibPagerConfig.itemsPerPage = ITEMS_PER_PAGE;
    uibPagerConfig.previousText = '«';
    uibPagerConfig.nextText = '»';
}
