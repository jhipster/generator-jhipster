import Vue from 'vue'
import moment from 'moment'

export function initFilters() {
    Vue.filter('formatDate', function(value) {
        if (value) {
            return moment(String(value)).format('DD/MM/YYYY hh:mm')
        }
    });
}
