import {email, maxLength, minLength, required} from 'vuelidate/lib/validators'
import axios from 'axios'
import Principal from '../Principal.vue';
import LanguageService from '../../../locale/LanguageService.vue';
import {EMAIL_ALREADY_USED_TYPE} from '../../../constants';

const Settings = {
    mixins: [Principal, LanguageService],
    data() {
        return {
            success: null,
            error: null,
            errorEmailExists: null
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
            this.error = null;
            this.errorEmailExists = null;
            axios.post('api/account', this.settingsAccount)
                .then(() => {
                    vm.error = null;
                    vm.success = "OK";
                    vm.errorEmailExists = null;
                })
                .catch(error => {
                    vm.success = null;
                    vm.error = 'ERROR';
                    if (error.response.status === 400 && error.response.data.type === EMAIL_ALREADY_USED_TYPE) {
                        vm.errorEmailExists = 'ERROR';
                        vm.error = null;
                    }
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
