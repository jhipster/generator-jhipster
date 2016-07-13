import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class <%=jhiPrefixCapitalized%>ConfigurationService {

    constructor(private http:Http) {
    }

    get():Observable<any> {
        return this.http.get('management/configprops').map((res:Response) => {
            let properties:any[] = [];

            const propertiesObject = res.json();

            for(var key in propertiesObject) {
                properties.push(propertiesObject[key]);
            }

            return properties.sort((propertyA, propertyB) => {
                if (propertyA.prefix === propertyB.prefix)
                    return 0;
                else if (propertyA.prefix < propertyB.prefix)
                    return -1;
                else if (propertyA.prefix > propertyB.prefix)
                    return 1;
            });
        });
    }

    getEnv(): Observable<any> {
        return this.http.get('management/env').map((res:Response) => {
            let properties:any = {};

            const propertiesObject = res.json();

            for(var key in propertiesObject) {
                let valsObject = propertiesObject[key];
                let vals:any[] = [];

                for(var valKey in valsObject) {
                    vals.push({key: valKey, val:valsObject[valKey]});
                }
                properties[key] = vals;
            }

            return properties;
        });
    }
}
