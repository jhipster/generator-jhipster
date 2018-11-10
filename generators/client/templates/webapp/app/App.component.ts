import Ribbon from './components/ribbon/Ribbon.vue';
import JhiFooter from './components/jhi-footer/JhiFooter.vue';
import JhiNavbar from './components/jhi-navbar/JhiNavbar.vue';
import LoginForm from './components/account/login-form/LoginForm.vue';

const App = {
    name: 'App',
    components: {
        'ribbon': Ribbon,
        'jhi-navbar': JhiNavbar,
        'jhi-footer': JhiFooter,
        'login-form': LoginForm,
    }
}

export default App;
