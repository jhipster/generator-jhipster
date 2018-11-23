<script>
    import axios from 'axios';

    export default {
        name: 'UserService',
        methods: {
            retrieveUsers: function () {
                return axios.get('/api/users');
            }
        }
    }
</script>
