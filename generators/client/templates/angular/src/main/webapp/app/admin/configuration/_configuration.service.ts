<%#
 Copyright 2013-2018 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see http://www.jhipster.tech/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { SERVER_API_URL } from '../../app.constants';

@Injectable()
export class <%=jhiPrefixCapitalized%>ConfigurationService {

    constructor(private http: HttpClient) {
    }

    get(): Observable<any> {
        return this.http.get(SERVER_API_URL + 'management/configprops', { observe: 'response' }).map((res: HttpResponse<any>) => {
            const properties: any[] = [];

            const propertiesObject = res.body;

            for (const key in propertiesObject) {
                if (propertiesObject.hasOwnProperty(key)) {
                    properties.push(propertiesObject[key]);
                }
            }

            return properties.sort((propertyA, propertyB) => {
                return (propertyA.prefix === propertyB.prefix) ? 0 :
                       (propertyA.prefix < propertyB.prefix) ? -1 : 1;
            });
        });
    }

    getEnv(): Observable<any> {
        return this.http.get(SERVER_API_URL + 'management/env', { observe: 'response' }).map((res: HttpResponse<any>) => {
            const properties: any = {};

            const propertiesObject = res.body;

            for (const key in propertiesObject) {
                if (propertiesObject.hasOwnProperty(key)) {
                    const valsObject = propertiesObject[key];
                    const vals: any[] = [];

                    for (const valKey in valsObject) {
                        if (valsObject.hasOwnProperty(valKey)) {
                            vals.push({key: valKey, val: valsObject[valKey]});
                        }
                    }
                    properties[key] = vals;
                }
            }

            return properties;
        });
    }
}
