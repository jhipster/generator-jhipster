import { ITEMS_PER_PAGE } from '../../components/form/pagination.constants';

PaginationConfig.$inject = ['uibPaginationConfig'];

export function PaginationConfig(uibPaginationConfig) {
    uibPaginationConfig.itemsPerPage = ITEMS_PER_PAGE;
    uibPaginationConfig.maxSize = 5;
    uibPaginationConfig.boundaryLinks = true;
    uibPaginationConfig.firstText = '«';
    uibPaginationConfig.previousText = '‹';
    uibPaginationConfig.nextText = '›';
    uibPaginationConfig.lastText = '»';
}
