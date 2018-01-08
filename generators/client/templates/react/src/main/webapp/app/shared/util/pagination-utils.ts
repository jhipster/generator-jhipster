export interface IPaginationState {
    itemsPerPage: number;
    sort: string;
    order: string;
    activePage: number;
}

export const getUrlParameter = (name, search) => {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};
