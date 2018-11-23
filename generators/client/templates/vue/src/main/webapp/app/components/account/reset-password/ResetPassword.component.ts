import {email, maxLength, minLength, required} from 'vuelidate/lib/validators'
import axios from 'axios'
import {EMAIL_NOT_FOUND_TYPE} from "../../../constants";

const ResetPassword = {
    data() {
        return {
            errorEmailNotExists: null,
            success: null,
            resetAccount: {
                email: null
            }
        }
    },
    validations: {
        resetAccount: {
            email: {
                required,
                minLength: minLength(5),
                maxLength: maxLength(254),
                email
            }
        }
    },
    methods: {
        requestReset: function () {
            let vm = this;
            axios.post('api/account/reset-password/init', this.resetAccount.email).then(() => {
                vm.success = true;
            }).catch(error => {
                this.success = null;
                if (error.response.status === 400 && error.response.data.type === EMAIL_NOT_FOUND_TYPE) {
                    this.errorEmailNotExists = 'ERROR';
                } else {
                    this.error = 'ERROR';
                }
            });
        }
    }
};

export default ResetPassword;
