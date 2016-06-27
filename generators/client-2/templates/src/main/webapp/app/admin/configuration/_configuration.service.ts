import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';


@Injectable()
export class <%=jhiPrefixCapitalized%>ConfigurationService {

    constructor( private http:Http ){} 

    get () {
         return this.http.get('management/configprops').toPromise()
               .then( getConfigPropsComplete );
               
            function getConfigPropsComplete (response) {
                let properties: any[] = [];
                response.data.forEach(prop => {
                    properties.push(prop);
                });                

                return properties.sort( (propertyA, propertyB) => {	
                        if ( propertyA.prefix === propertyB.prefix ) 
                            return 0;
                        else if ( propertyA.prefix < propertyB.prefix )
                            return -1;
                        else if ( propertyA.prefix > propertyB.prefix )
                            return 1;
                });                
            }
        }

         getEnv () {            
             return this.http.get('management/env').toPromise()
               .then( getEnvComplete );

            function getEnvComplete (response) {
                let properties: any = {};
                response.data.forEach(prop => {
                    let vals: any[] = [];
                    prop.val.forEach(valKey => {
                        vals.push(valKey);
                    });
                    properties[prop.key] = vals;
                });
                return properties;
            }
        }
}