import axios from 'axios'
import Principal from '../Principal.vue';
import { mapGetters } from 'vuex'

const Sessions = {
    mixins: [Principal],
    data() {
        return {
            success: null,
            error: null,
            sessions: []
        }
    },
    created() {
        this.retrieveSessions();
    },
    methods: {
        retrieveSessions: function () {
            let vm = this;
            axios.get('api/account/sessions/')
                .then(response => {
                    vm.error = null;
                    vm.sessions = response.data;
                });
        },
        invalidate: function (session) {
            let vm = this;
            axios.delete('api/account/sessions/' + session)
                .then(() => {
                    vm.error = null;
                    vm.success = 'OK';
                    vm.retrieveSessions();
                })
                .catch(error => {
                    vm.success = null;
                    vm.error = 'ERROR';
                });
        }
    },
    computed: {
        ...mapGetters([
            'account'
        ])
    }
};

export default Sessions;
