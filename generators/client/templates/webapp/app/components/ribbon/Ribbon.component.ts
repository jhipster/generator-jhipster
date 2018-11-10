import axios from 'axios'

const Ribbon = {
    name: 'Ribbon',
    data () {
        return {
            ribbonEnv: null
        }
    },
    created() {
        let vm = this;
        axios.get('management/info').then(function (res) {
            if (res.data && res.data.activeProfiles && res.data.activeProfiles.indexOf(res.data['display-ribbon-on-profiles']) > -1) {
                vm.ribbonEnv = res.data['display-ribbon-on-profiles'];
            }
        });
    }
};

export default Ribbon;
