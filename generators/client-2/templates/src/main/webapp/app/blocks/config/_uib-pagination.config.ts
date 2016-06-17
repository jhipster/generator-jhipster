import {ITEMSPERPAGE} from "../../components/form/pagination.constants";

PaginationConfig.$inject = ['uibPaginationConfig'];

export function PaginationConfig(uibPaginationConfig) {
    uibPaginationConfig.itemsPerPage = ITEMSPERPAGE;
    uibPaginationConfig.maxSize = 5;
    uibPaginationConfig.boundaryLinks = true;
    uibPaginationConfig.firstText = '«';
    uibPaginationConfig.previousText = '‹';
    uibPaginationConfig.nextText = '›';
    uibPaginationConfig.lastText = '»';
}
