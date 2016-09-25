import * as angular from 'angular';

import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';


@Injectable()
export class <%=jhiPrefixCapitalized%>HealthService {

    separator: string;

    constructor (private http: Http) {
        this.separator = '.';
    }

    checkHealth(): Observable<any> {
        return this.http.get('management/health').map((res: Response) => res.json());
    }

    transformHealthData (data): any {
        let response = [];
        this.flattenHealthData(response, null, data);
        return response;
    }

    getBaseName (name): string {
        if (name) {
            let split = name.split('.');
            return split[0];
        }
    }

    getSubSystemName (name) : string{
        if (name) {
            let split = name.split('.');
            split.splice(0, 1);
            let remainder = split.join('.');
            return remainder ? ' - ' + remainder : '';
        }
    }

    /* private methods */
    private addHealthObject (result, isLeaf, healthObject, name): any {

        let status:any;
        let error:any;
        let healthData = {
            'name': name,
            'error': error,
            'status': status
        };

        let details = {};
        let hasDetails = false;

        for(var key in healthObject) {
            let value = healthObject[key];
            if (key === 'status' || key === 'error') {
                healthData[key] = value;
            } else {
                if (!this.isHealthObject(value)) {
                    details[key] = value;
                    hasDetails = true;
                }
            }
        }

        // Add the of the details
        if (hasDetails) {
            angular.extend(healthData, { 'details': details});
        }

        // Only add nodes if they provide additional information
        if (isLeaf || hasDetails || healthData.error) {
            result.push(healthData);
        }
        return healthData;
    }

    private flattenHealthData (result, path, data): any {
        for(var key in data) {
            let value = data[key];
            if (this.isHealthObject(value)) {
                if (this.hasSubSystem(value)) {
                    this.addHealthObject(result, false, value, this.getModuleName(path, key));
                    this.flattenHealthData(result, this.getModuleName(path, key), value);
                } else {
                    this.addHealthObject(result, true, value, this.getModuleName(path, key));
                }
            }
        }

        return result;
    }


    private getModuleName (path, name): string {
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

    private hasSubSystem (healthObject): boolean {
        let result = false;

        for(var key in healthObject) {
            let value = healthObject[key];
            if (value && value.status) {
                result = true;
            }
        }

        return result;
    }

    private isHealthObject (healthObject): boolean {
        let result = false;

        for(var key in healthObject) {
            if (key === 'status') {
                result = true;
            }
        }

        return result;
    }
}
