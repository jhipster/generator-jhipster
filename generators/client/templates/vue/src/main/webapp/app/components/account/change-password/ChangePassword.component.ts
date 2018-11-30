import { maxLength, minLength, required } from 'vuelidate/lib/validators';
import axios from 'axios';
import Principal from '../Principal.vue';
import { mapGetters } from 'vuex';

const ChangePassword = {
  mixins: [Principal],
  data() {
    return {
      success: null,
      error: null,
      doNotMatch: null,
      resetPassword: {
        currentPassword: null,
        newPassword: null,
        confirmPassword: null
      }
    };
  },
  validations: {
    resetPassword: {
      currentPassword: {
        required
      },
      newPassword: {
        required,
        minLength: minLength(4),
        maxLength: maxLength(254)
      },
      confirmPassword: {
        required,
        minLength: minLength(4),
        maxLength: maxLength(254)
      }
    }
  },
  methods: {
    changePassword: function() {
      if (this.resetPassword.newPassword !== this.resetPassword.confirmPassword) {
        this.error = null;
        this.success = null;
        this.doNotMatch = 'ERROR';
      } else {
        this.doNotMatch = null;
        axios
          .post('api/account/change-password', {
            currentPassword: this.resetPassword.currentPassword,
            newPassword: this.resetPassword.newPassword
          })
          .then(() => {
            this.success = 'OK';
            this.error = null;
          })
          .catch(() => {
            this.success = null;
            this.error = 'ERROR';
          });
      }
    }
  },
  computed: {
    ...mapGetters(['account'])
  }
};

export default ChangePassword;
