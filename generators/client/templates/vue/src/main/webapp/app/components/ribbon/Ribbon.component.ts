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
    axios.get('management/info').then((res) => {
      if (res.data && res.data.activeProfiles && res.data.activeProfiles.indexOf(res.data['display-ribbon-on-profiles']) > -1) {
        this.ribbonEnv = res.data['display-ribbon-on-profiles'];
      }
    });
  }
};
