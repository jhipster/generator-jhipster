import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';


@Injectable()
export class <%=jhiPrefixCapitalized%>ConfigurationService {

    constructor( private http:Http ){} 

    var service = {
        get: get,
        getEnv: getEnv
    };

    return service;

     function get () {
         return this.http.get('management/configprops').toPromise()
               .then( getConfigPropsComplete );
               
            function getConfigPropsComplete (response) {
                var properties = [];
                response.data.forEach(prop => {
                    properties.push(prop);
                });                

                return properties.filter(properties => 'prefix');                
            }
        }

        function getEnv () {            
             return this.http.get('management/env').toPromise()
               .then( getEnvComplete );

            function getEnvComplete (response) {
                var properties = {};
                response.data.forEach(prop => {
                    var vals = [];
                    prop.val.forEach(valKey => {
                        vals.push(valKey);
                    });
                    properties[prop.key] = vals;
                });
                return properties;
            }
        }
}