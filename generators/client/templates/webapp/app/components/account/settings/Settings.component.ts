import {email, maxLength, minLength, required} from 'vuelidate/lib/validators'
import axios from 'axios'
import Principal from '../Principal.vue';
import LanguageService from '../../../locale/LanguageService.vue';

const Settings = {
    mixins: [Principal, LanguageService],
    data() {
        return {
            success: null,
            error: null
        }
    },
    validations: {
        settingsAccount: {
            firstName: {
                required,
                minLength: minLength(1),
                maxLength: maxLength(50)
            },
            lastName: {
                required,
                minLength: minLength(1),
                maxLength: maxLength(50)
            },
            email: {
                required,
                email,
                minLength: minLength(5),
                maxLength: maxLength(254)
            }
        }
    },
    methods: {
        save: function () {
            let vm = this;
            axios.post('api/account', this.settingsAccount)
                .then(() => {
                    vm.error = null;
                    vm.success = "OK";
                    vm.retrieveAccount();
                })
                .catch(error => {
                    vm.success = null;
                    vm.error = 'ERROR';
                });
        }
    },
    computed: {
        settingsAccount() {
            return this.$store.getters.account
        }
    }
};

export default Settings;
