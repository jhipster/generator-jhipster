'use strict';

module.exports = {
    getPrimaryKeyField: getPrimaryKeyField
};

function getPrimaryKeyField(fields) {
    var fieldId;
    for (fieldId in fields) {
        if (fields[fieldId].isPk == true) {
            return fields[fieldId];
        }
    }
}
