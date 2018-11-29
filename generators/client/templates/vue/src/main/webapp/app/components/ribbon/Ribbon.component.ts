import axios from 'axios';
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class Ribbon extends Vue {
  public ribbonEnv: string;

  constructor() {
    super();
    this.ribbonEnv = null;
  }

  public created(): void {
    let vm = this;
    axios.get('management/info').then(function(res) {
      if (res.data && res.data.activeProfiles && res.data.activeProfiles.indexOf(res.data['display-ribbon-on-profiles']) > -1) {
        vm.ribbonEnv = res.data['display-ribbon-on-profiles'];
      }
    });
  }
};
