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
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { SERVER_API_URL } from '../../app.constants';

@Injectable()
export class <%=jhiPrefixCapitalized%>HealthService {

    separator: string;

    constructor(private http: HttpClient) {
        this.separator = '.';
    }

    checkHealth(): Observable<any> {
        return this.http.get(SERVER_API_URL + 'management/health');
    }

    transformHealthData(data): any {
        const response = [];
        this.flattenHealthData(response, null, data);
        return response;
    }

    getBaseName(name): string {
        if (name) {
            const split = name.split('.');
            return split[0];
        }
    }

    getSubSystemName(name): string {
        if (name) {
            const split = name.split('.');
            split.splice(0, 1);
            const remainder = split.join('.');
            return remainder ? ' - ' + remainder : '';
        }
    }

    /* private methods */
    private addHealthObject(result, isLeaf, healthObject, name): any {
        const healthData: any = {
            name
        };

        const details = {};
        let hasDetails = false;

        for (const key in healthObject) {
            if (healthObject.hasOwnProperty(key)) {
                const value = healthObject[key];
                if (key === 'status' || key === 'error') {
                    healthData[key] = value;
                } else {
                    if (!this.isHealthObject(value)) {
                        details[key] = value;
                        hasDetails = true;
                    }
                }
            }
        }

        // Add the details
        if (hasDetails) {
            healthData.details = details;
        }

        // Only add nodes if they provide additional information
        if (isLeaf || hasDetails || healthData.error) {
            result.push(healthData);
        }
        return healthData;
    }

    private flattenHealthData(result, path, data): any {
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const value = data[key];
                if (this.isHealthObject(value)) {
                    if (this.hasSubSystem(value)) {
                        this.addHealthObject(result, false, value, this.getModuleName(path, key));
                        this.flattenHealthData(result, this.getModuleName(path, key), value);
                    } else {
                        this.addHealthObject(result, true, value, this.getModuleName(path, key));
                    }
                }
            }
        }
        return result;
    }

    private getModuleName(path, name): string {
        let result;
        if (path && name) {
            result = path + this.separator + name;
        }  else if (path) {
            result = path;
        } else if (name) {
            result = name;
        } else {
            result = '';
        }
        return result;
    }

    private hasSubSystem(healthObject): boolean {
        let result = false;

        for (const key in healthObject) {
            if (healthObject.hasOwnProperty(key)) {
                const value = healthObject[key];
                if (value && value.status) {
                    result = true;
                }
            }
        }
        return result;
    }

    private isHealthObject(healthObject): boolean {
        let result = false;

        for (const key in healthObject) {
            if (healthObject.hasOwnProperty(key)) {
                if (key === 'status') {
                    result = true;
                }
            }
        }
        return result;
    }
}
