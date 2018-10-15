import Vue from 'vue'
import Router from 'vue-router'
import Home from '../components/Home'
import Register from '../components/account/Register'
import ResetPassword from '../components/account/ResetPassword'
import ChangePassword from '../components/account/ChangePassword'
import Sessions from '../components/account/Sessions'
import Settings from '../components/account/Settings'
// jhipster-needle-add-entity-to-router-import - JHipster will import entities to the router here

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/',
            name: 'Home',
            component: Home
        },
        {
            path: '/register',
            name: 'Register',
            component: Register
        },
        {
            path: '/resetPassword',
            name: 'ResetPassword',
            component: ResetPassword
        },
        {
            path: '/changePassword',
            name: 'ChangePassword',
            component: ChangePassword
        },
        {
            path: '/sessions',
            name: 'Sessions',
            component: Sessions
        },
        {
            path: '/settings',
            name: 'Settings',
            component: Settings
        }
        // jhipster-needle-add-entity-to-router - JHipster will add entities to the router here

    ]
})
