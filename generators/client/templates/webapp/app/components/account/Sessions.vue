<template>
    <div>
        <h2 v-if="account"><span v-bind:value="$t('sessions.title')">Active sessions for [<b>{{username}}</b>]</span></h2>

        <div class="alert alert-success" v-if="success" v-html="$t('sessions.messages.success')">
            <strong>Session invalidated!</strong>
        </div>
        <div class="alert alert-danger" v-if="error" v-html="$t('sessions.messages.error')">
            <strong>An error has occured!</strong> The session could not be invalidated.
        </div>

        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                <tr>
                    <th v-text="$t('sessions.table.ipaddress')">IP Address</th>
                    <th v-text="$t('sessions.table.useragent')">User agent</th>
                    <th v-text="$t('sessions.table.date')">Date</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="session in sessions">
                    <td>{{session.ipAddress}}</td>
                    <td>{{session.userAgent}}</td>
                    <td>{{session.tokenDate}}</td>
                    <td>
                        <button type="submit"
                                class="btn btn-primary"
                                v-on:click="invalidate(session.series)" v-text="$t('sessions.table.button')">
                            Invalidate
                        </button>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
<script>
    import axios from 'axios'
    import Principal from './Principal';
    import { mapGetters } from 'vuex'

    export default {
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
    }
</script>
