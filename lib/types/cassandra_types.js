'use strict';

const AbstractMappedTypes = require('./abstract_mapped_types');

/**
 * This class extends the Types interface to provide the Cassandra types
 * supported by JHipster.
 */
var CassandraTypes = module.exports = function () {
  this.types = {
    UUID: ['required'],
    String: ['required', 'minlength', 'maxlength', 'pattern'],
    Integer: ['required', 'min', 'max'],
    Long: ['required', 'min', 'max'],
    BigDecimal: ['required', 'min', 'max'],
    Date: ['required'],
    Boolean: ['required'],
    Float: ['required', 'min', 'max'],
    Double: ['required', 'min', 'max']
  };
};

// inheritance stuff
CassandraTypes.prototype = Object.create(AbstractMappedTypes.prototype);
CassandraTypes.prototype.constructor = AbstractMappedTypes;
