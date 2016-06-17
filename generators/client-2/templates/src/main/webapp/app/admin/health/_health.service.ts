import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';

<%=jhiPrefixCapitalized%>HealthService.$inject = ['$rootScope'];

@Injectable()
export function <%=jhiPrefixCapitalized%>HealthService ($rootScope) {
            
    var separator = '.';
    var service = {
        checkHealth: checkHealth,
        transformHealthData: transformHealthData,
        getBaseName: getBaseName,
        getSubSystemName: getSubSystemName
    };

    return service;


    function checkHealth () {
        return this.http.get('management/health').toPromise().
            then(response => {
                return response.data;
            });
    }

    function transformHealthData (data) {
        var response = [];
        flattenHealthData(response, null, data);
        return response;
    }

    function getBaseName (name) {
        if (name) {
            var split = name.split('.');
            return split[0];
        }
    }

    function getSubSystemName (name) {
        if (name) {
            var split = name.split('.');
            split.splice(0, 1);
            var remainder = split.join('.');
            return remainder ? ' - ' + remainder : '';
        }
    }

    /* private methods */
    function flattenHealthData (result, path, data) {
        data.forEach( (value, key) => { 
            if (isHealthObject(value)) {
                if (hasSubSystem(value)) {
                    addHealthObject(result, false, value, getModuleName(path, key));
                    flattenHealthData(result, getModuleName(path, key), value);
                } else {
                    addHealthObject(result, true, value, getModuleName(path, key));
                }
            }
        });
        return result;
    }

    function addHealthObject (result, isLeaf, healthObject, name) {

        var healthData = {
            'name': name
        };
        var details = {};
        var hasDetails = false;

        healthObject.forEach( (value, key) => { 
            if (key === 'status' || key === 'error') {
                healthData[key] = value;
            } else {
                if (!isHealthObject(value)) {
                    details[key] = value;
                    hasDetails = true;
                }
            }
        });

        // Add the of the details
        if (hasDetails) {
            extend(healthData, { 'details': details});
        }

        // Only add nodes if they provide additional information
        if (isLeaf || hasDetails || healthData.error) {
            result.push(healthData);
        }
        return healthData;
    }

    function getModuleName (path, name) {
        var result;
        if (path && name) {
            result = path + separator + name;
        }  else if (path) {
            result = path;
        } else if (name) {
            result = name;
        } else {
            result = '';
        }
        return result;
    }

    function hasSubSystem (healthObject) {
        var result = false;
        healthObject.forEach( (value) => {
            if (value && value.status) {
                result = true;
            }
        });
        return result;
    }

    function isHealthObject (healthObject) {
        var result = false;
        healthObject.forEach( (value, key) => {
            if (key === 'status') {
                result = true;
            }
        });
        return result;
    }

}
