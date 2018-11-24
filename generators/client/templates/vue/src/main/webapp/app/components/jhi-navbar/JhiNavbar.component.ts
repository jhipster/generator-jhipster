import axios from 'axios';
import {VERSION} from "../../constants";
import TranslationService from '../../locale/TranslationService.vue';
import LoginModalService from '../account/LoginModalService.vue';
import Principal from '../account/Principal.vue';
import LanguageService from '../../locale/LanguageService.vue';

const JhiNavbar = {
    name: 'JhiNavbar',
    mixins: [TranslationService, LoginModalService, Principal, LanguageService],
    data : function() {
        return {
            version : VERSION ? 'v' + VERSION : '',
            swaggerEnabled: false,
            inProduction: false,
            isNavbarCollapsed: true
        }
    },
    created: function() {
        let vm = this;
        axios.get('management/info').then(function (res) {
            if (res.data && res.data.activeProfiles && res.data.activeProfiles.indexOf('swagger') > -1) {
                vm.swaggerEnabled = true;
            }
            if (res.data && res.data.activeProfiles && res.data.activeProfiles.indexOf('prod') > -1) {
                vm.inProduction = true;
            }
        });
    },
    methods: {
        getImageUrl: function() {
            return false;
        },
        collapseNavbar() {
            this.isNavbarCollapsed = true;
        },
        changeLanguage: function (language) {
            this.currentLanguage = language;
        },
        logout: function () {
            localStorage.removeItem('jhi-authenticationToken');
            sessionStorage.removeItem('jhi-authenticationToken');
            this.$store.commit('logout');
            this.$router.push('/');
        }
    },
    computed: {
        authenticated(){
            return this.$store.getters.authenticated;
        }
    }
};

export default JhiNavbar;
