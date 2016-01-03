// camelCase To Human/dash-case and vice-versa Filter
angular.module('<%=angularAppName%>')
    // Converts a camelCase string to a human readable string.
    // i.e. myVariableName => My Variable Name
    .filter('camelToHuman', function () {
        return function (input) {
            if (input)
                return input.charAt(0).toUpperCase() + input.substr(1).replace(/[A-Z]/g, ' $&');
            else return '';
        }
    })
    // Converts a camelCase string to a dash-case string.
    // i.e. myVariableName => my-variable-name
    .filter('camelToDashed', function () {
        return function (input) {
            if (input)
                return input.replace(/[A-Z]/g, function (match, pos) {
                    return (pos > 0 ? '-' : '') + match.toLowerCase();
                });
            else return '';
        }
    })
    // Converts a dash-case string to a camelCase string.
    // i.e. my-variable-name => myVariableName
    .filter('dashedToCamel', function () {
        return function (input) {
            return input ? $.camelCase(input) : '';
        }
    })
    // Converts a dash-case string to a human readable string.
    // i.e. my-variable-name => My Variable Name
    .filter('dashedToHuman', function () {
        return function (inp) {
            if (input) {
                var input = $.camelCase(inp);
                return input.charAt(0).toUpperCase() + input.substr(1).replace(/[A-Z]/g, ' $&');
            } else return '';
        }
    });
