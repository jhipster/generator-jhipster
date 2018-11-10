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
            isNavbarCollapsed: true,
        }
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
