import {ITEMSPERPAGE} from "../../components/form/pagination.constants";

PagerConfig.$inject = ['uibPagerConfig'];

export function PagerConfig(uibPagerConfig) {
    uibPagerConfig.itemsPerPage = ITEMSPERPAGE;
    uibPagerConfig.previousText = '«';
    uibPagerConfig.nextText = '»';
}
