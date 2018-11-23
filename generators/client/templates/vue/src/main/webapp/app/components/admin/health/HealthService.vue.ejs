<script>
    import axios from 'axios';

    export default {
        name: 'HealthService',
        data() {
            return {
                separator: '.'
            }
        },
        methods: {
            checkHealth: function() {
                return axios.get('management/health');
            },
            transformHealthData: function(data) {
                const response = [];
                this.flattenHealthData(response, null, data.details);
                return response;
            },
            getBaseName: function(name) {
                if (name) {
                    const split = name.split('.');
                    return split[0];
                }
            },
            getSubSystemName: function(name) {
                if (name) {
                    const split = name.split('.');
                    split.splice(0, 1);
                    const remainder = split.join('.');
                    return remainder ? ' - ' + remainder : '';
                }
            },
            addHealthObject: function(result, isLeaf, healthObject, name) {
                const healthData = {
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
            },
            flattenHealthData: function(result, path, data) {
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
            },
            getModuleName: function(path, name) {
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
            },
            hasSubSystem: function(healthObject) {
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
            },
            isHealthObject: function(healthObject) {
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
    }
</script>
