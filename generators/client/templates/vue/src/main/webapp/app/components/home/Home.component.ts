import LoginModalService from '../account/LoginModalService.vue';
import Principal from '../account/Principal.vue';
import { mapGetters } from 'vuex';

const Home = {
    name: 'Home',
    mixins: [LoginModalService, Principal],
    computed: {
        ...mapGetters([
            'authenticated',
            'account',
        ])
    }
};

export default Home;
