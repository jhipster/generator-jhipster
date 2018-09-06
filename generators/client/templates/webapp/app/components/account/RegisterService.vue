<script>
    import axios from 'axios'
    import {SERVER_API_URL} from "../../constants";

    export default {
        name: 'RegisterService',
        methods: {
            processRegistration: function(account) {
                return axios.post(SERVER_API_URL + 'api/register', account);
            }
        }
    }
</script>
