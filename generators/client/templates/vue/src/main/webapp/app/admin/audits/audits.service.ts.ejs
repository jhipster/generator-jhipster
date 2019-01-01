import axios, { AxiosInstance } from 'axios';

export default class AuditsService {
  private axios: AxiosInstance;

  constructor() {
    this.axios = axios;
  }

  public query(req: any): Promise<any> {
    let sorts = '';
    for (const idx of Object.keys(req.sort)) {
      if (sorts.length > 0) {
        sorts += '&';
      }
      sorts += 'sort=' + req.sort[idx];
    }
    return new Promise(resolve => {
      axios
        .get(`management/audits?fromDate=${req.fromDate}&toDate=${req.toDate}&${sorts}&page=${req.page}&size=${req.size}`)
        .then(res => resolve(res));
    });
  }
}
