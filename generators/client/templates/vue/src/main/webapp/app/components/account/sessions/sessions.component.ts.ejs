import axios from 'axios';
import Principal from '../Principal.vue';
import { mapGetters } from 'vuex';

const Sessions = {
  mixins: [Principal],
  data() {
    return {
      success: null,
      error: null,
      sessions: []
    };
  },
  created() {
    this.retrieveSessions();
  },
  methods: {
    retrieveSessions: function() {
      axios.get('api/account/sessions/').then((response) => {
        this.error = null;
        this.sessions = response.data;
      });
    },
    invalidate: function(session) {
      axios
        .delete('api/account/sessions/' + session)
        .then(() => {
          this.error = null;
          this.success = 'OK';
          this.retrieveSessions();
        })
        .catch(() => {
          this.success = null;
          this.error = 'ERROR';
        });
    }
  },
  computed: {
    ...mapGetters(['account'])
  }
};

export default Sessions;
