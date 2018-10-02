<script>
    import axios from 'axios'
    import {SERVER_API_URL} from "../../constants";
    import TranslationService from '../../locale/TranslationService';

    export default {
        name: 'Principal',
        mixins: [TranslationService],
        created: function() {
            if (!this.$store.getters.account && !this.$store.getters.logon && (this.$cookie.get('JSESSIONID') || this.$cookie.get('XSRF-TOKEN'))) {
                this.retrieveAccount();
            }
        },
        methods: {
            retrieveAccount: function() {
                let vm = this;
                vm.$store.commit('authenticate');
                axios.get(SERVER_API_URL + 'api/account').then(function (response) {
                    const account = response.data;
                    if (account) {
                        vm.$store.commit('authenticated', account);
                        if (vm.currentLanguage !== account.langKey) {
                            vm.currentLanguage = account.langKey;
                        }
                        vm.$router.push('/');
                    } else {
                        vm.$store.commit('logout');
                    }
                }).catch(function () {
                    vm.$store.commit('logout');
                });
            },
            hasAnyAuthority: function(authorities) {
                if (typeof authorities === "string") {
                    authorities = [authorities];
                }
                if (!this.authenticated || !this.userAuthorities) {
                    return false;
                }

                for (let i = 0; i < authorities.length; i++) {
                    if (this.userAuthorities.includes(authorities[i])) {
                        return true;
                    }
                }

                return false;
            }
        },
        computed:{
            userAuthorities(){
                return this.$store.getters.account.authorities;
            },
             username() {
                  return this.$store.getters.account ? this.$store.getters.account.login : ''
             }
        }
    }
</script>
