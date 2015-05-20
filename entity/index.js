'use strict';
var util = require('util'),
        fs = require('fs'),
        path = require('path'),
        yeoman = require('yeoman-generator'),
        chalk = require('chalk'),
        _s = require('underscore.string'),
        shelljs = require('shelljs'),
        scriptBase = require('../script-base');

var reservedWords_Java = ["ABSTRACT", "CONTINUE", "FOR", "NEW", "SWITCH", "ASSERT", "DEFAULT", "GOTO", "PACKAGE", "SYNCHRONIZED", "BOOLEAN", "DO", "IF", "PRIVATE", "THIS", "BREAK", "DOUBLE", "IMPLEMENTS", "PROTECTED", "THROW", "BYTE", "ELSE", "IMPORT", "PUBLIC", "THROWS", "CASE", "ENUM", "INSTANCEOF", "RETURN", "TRANSIENT", "CATCH", "EXTENDS", "INT", "SHORT", "TRY", "CHAR", "FINAL", "INTERFACE", "STATIC", "VOID", "CLASS", "FINALLY", "LONG", "STRICTFP", "VOLATILE", "CONST", "FLOAT", "NATIVE", "SUPER", "WHILE"];

var reservedWords_MySQL = ["ACCESSIBLE", "ADD", "ALL", "ALTER", "ANALYZE", "AND", "AS", "ASC", "ASENSITIVE", "BEFORE", "BETWEEN", "BIGINT", "BINARY", "BLOB", "BOTH", "BY", "CALL", "CASCADE", "CASE", "CHANGE", "CHAR", "CHARACTER", "CHECK", "COLLATE", "COLUMN", "CONDITION", "CONSTRAINT", "CONTINUE", "CONVERT", "CREATE", "CROSS", "CURRENT_DATE", "CURRENT_TIME", "CURRENT_TIMESTAMP", "CURRENT_USER", "CURSOR", "DATABASE", "DATABASES", "DAY_HOUR", "DAY_MICROSECOND", "DAY_MINUTE", "DAY_SECOND", "DEC", "DECIMAL", "DECLARE", "DEFAULT", "DELAYED", "DELETE", "DESC", "DESCRIBE", "DETERMINISTIC", "DISTINCT", "DISTINCTROW", "DIV", "DOUBLE", "DROP", "DUAL", "EACH", "ELSE", "ELSEIF", "ENCLOSED", "ESCAPED", "EXISTS", "EXIT", "EXPLAIN", "FALSE", "FETCH", "FLOAT", "FLOAT4", "FLOAT8", "FOR", "FORCE", "FOREIGN", "FROM", "FULLTEXT", "GRANT", "GROUP", "HAVING", "HIGH_PRIORITY", "HOUR_MICROSECOND", "HOUR_MINUTE", "HOUR_SECOND", "IF", "IGNORE", "IN", "INDEX", "INFILE", "INNER", "INOUT", "INSENSITIVE", "INSERT", "INT", "INT1", "INT2", "INT3", "INT4", "INT8", "INTEGER", "INTERVAL", "INTO", "IS", "ITERATE", "JOIN", "KEY", "KEYS", "KILL", "LEADING", "LEAVE", "LEFT", "LIKE", "LIMIT", "LINEAR", "LINES", "LOAD", "LOCALTIME", "LOCALTIMESTAMP", "LOCK", "LONG", "LONGBLOB", "LONGTEXT", "LOOP", "LOW_PRIORITY", "MASTER_SSL_VERIFY_SERVER_CERT", "MATCH", "MAXVALUE", "MEDIUMBLOB", "MEDIUMINT", "MEDIUMTEXT", "MIDDLEINT", "MINUTE_MICROSECOND", "MINUTE_SECOND", "MOD", "MODIFIES", "NATURAL", "NOT", "NO_WRITE_TO_BINLOG", "NULL", "NUMERIC", "ON", "OPTIMIZE", "OPTION", "OPTIONALLY", "OR", "ORDER", "OUT", "OUTER", "OUTFILE", "PRECISION", "PRIMARY", "PROCEDURE", "PURGE", "RANGE", "READ", "READS", "READ_WRITE", "REAL", "REFERENCES", "REGEXP", "RELEASE", "RENAME", "REPEAT", "REPLACE", "REQUIRE", "RESIGNAL", "RESTRICT", "RETURN", "REVOKE", "RIGHT", "RLIKE", "SCHEMA", "SCHEMAS", "SECOND_MICROSECOND", "SELECT", "SENSITIVE", "SEPARATOR", "SET", "SHOW", "SIGNAL", "SMALLINT", "SPATIAL", "SPECIFIC", "SQL", "SQLEXCEPTION", "SQLSTATE", "SQLWARNING", "SQL_BIG_RESULT", "SQL_CALC_FOUND_ROWS", "SQL_SMALL_RESULT", "SSL", "STARTING", "STRAIGHT_JOIN", "TABLE", "TERMINATED", "THEN", "TINYBLOB", "TINYINT", "TINYTEXT", "TO", "TRAILING", "TRIGGER", "TRUE", "UNDO", "UNION", "UNIQUE", "UNLOCK", "UNSIGNED", "UPDATE", "USAGE", "USE", "USING", "UTC_DATE", "UTC_TIME", "UTC_TIMESTAMP", "VALUES", "VARBINARY", "VARCHAR", "VARCHARACTER", "VARYING", "WHEN", "WHERE", "WHILE", "WITH", "WRITE", "XOR", "YEAR_MONTH", "ZEROFILL", "GENERAL", "IGNORE_SERVER_IDS", "MASTER_HEARTBEAT_PERIOD", "MAXVALUE", "RESIGNAL", "SIGNAL", "SLOW"];

var reservedWords_Postgresql = ["ABORT", "ABS", "ABSOLUTE", "ACCESS", "ACTION", "ADA", "ADD", "ADMIN", "AFTER", "AGGREGATE", "ALIAS", "ALL", "ALLOCATE", "ALTER", "ANALYSE", "ANALYZE", "AND", "ANY", "ARE", "ARRAY", "AS", "ASC", "ASENSITIVE", "ASSERTION", "ASSIGNMENT", "ASYMMETRIC", "AT", "ATOMIC", "AUTHORIZATION", "AVG", "BACKWARD", "BEFORE", "BEGIN", "BETWEEN", "BIGINT", "BINARY", "BIT", "BITVAR", "BIT_LENGTH", "BLOB", "BOOLEAN", "BOTH", "BREADTH", "BY", "C", "CACHE", "CALL", "CALLED", "CARDINALITY", "CASCADE", "CASCADED", "CASE", "CAST", "CATALOG", "CATALOG_NAME", "CHAIN", "CHAR", "CHARACTER", "CHARACTERISTICS", "CHARACTER_LENGTH", "CHARACTER_SET_CATALOG", "CHARACTER_SET_NAME", "CHARACTER_SET_SCHEMA", "CHAR_LENGTH", "CHECK", "CHECKED", "CHECKPOINT", "CLASS", "CLASS_ORIGIN", "CLOB", "CLOSE", "CLUSTER", "COALESCE", "COBOL", "COLLATE", "COLLATION", "COLLATION_CATALOG", "COLLATION_NAME", "COLLATION_SCHEMA", "COLUMN", "COLUMN_NAME", "COMMAND_FUNCTION", "COMMAND_FUNCTION_CODE", "COMMENT", "COMMIT", "COMMITTED", "COMPLETION", "CONDITION_NUMBER", "CONNECT", "CONNECTION", "CONNECTION_NAME", "CONSTRAINT", "CONSTRAINTS", "CONSTRAINT_CATALOG", "CONSTRAINT_NAME", "CONSTRAINT_SCHEMA", "CONSTRUCTOR", "CONTAINS", "CONTINUE", "CONVERSION", "CONVERT", "COPY", "CORRESPONDING", "COUNT", "CREATE", "CREATEDB", "CREATEUSER", "CROSS", "CUBE", "CURRENT", "CURRENT_DATE", "CURRENT_PATH", "CURRENT_ROLE", "CURRENT_TIME", "CURRENT_TIMESTAMP", "CURRENT_USER", "CURSOR", "CURSOR_NAME", "CYCLE", "DATA", "DATABASE", "DATETIME_INTERVAL_CODE", "DATETIME_INTERVAL_PRECISION", "DAY", "DEALLOCATE", "DEC", "DECIMAL", "DECLARE", "DEFAULT", "DEFERRABLE", "DEFERRED", "DEFINED", "DEFINER", "DELETE", "DELIMITER", "DELIMITERS", "DEPTH", "DEREF", "DESC", "DESCRIBE", "DESCRIPTOR", "DESTROY", "DESTRUCTOR", "DETERMINISTIC", "DIAGNOSTICS", "DICTIONARY", "DISCONNECT", "DISPATCH", "DISTINCT", "DO", "DOMAIN", "DOUBLE", "DROP", "DYNAMIC", "DYNAMIC_FUNCTION", "DYNAMIC_FUNCTION_CODE", "EACH", "ELSE", "ENCODING", "ENCRYPTED", "END", "END-EXEC", "EQUALS", "ESCAPE", "EVERY", "EXCEPT", "EXCEPTION", "EXCLUSIVE", "EXEC", "EXECUTE", "EXISTING", "EXISTS", "EXPLAIN", "EXTERNAL", "EXTRACT", "FALSE", "FETCH", "FINAL", "FIRST", "FLOAT", "FOR", "FORCE", "FOREIGN", "FORTRAN", "FORWARD", "FOUND", "FREE", "FREEZE", "FROM", "FULL", "FUNCTION", "G", "GENERAL", "GENERATED", "GET", "GLOBAL", "GO", "GOTO", "GRANT", "GRANTED", "GROUP", "GROUPING", "HANDLER", "HAVING", "HIERARCHY", "HOLD", "HOST", "HOUR", "IDENTITY", "IGNORE", "ILIKE", "IMMEDIATE", "IMMUTABLE", "IMPLEMENTATION", "IMPLICIT", "IN", "INCREMENT", "INDEX", "INDICATOR", "INFIX", "INHERITS", "INITIALIZE", "INITIALLY", "INNER", "INOUT", "INPUT", "INSENSITIVE", "INSERT", "INSTANCE", "INSTANTIABLE", "INSTEAD", "INT", "INTEGER", "INTERSECT", "INTERVAL", "INTO", "INVOKER", "IS", "ISNULL", "ISOLATION", "ITERATE", "JOIN", "K", "KEY", "KEY_MEMBER", "KEY_TYPE", "LANCOMPILER", "LANGUAGE", "LARGE", "LAST", "LATERAL", "LEADING", "LEFT", "LENGTH", "LESS", "LEVEL", "LIKE", "LIMIT", "LISTEN", "LOAD", "LOCAL", "LOCALTIME", "LOCALTIMESTAMP", "LOCATION", "LOCATOR", "LOCK", "LOWER", "M", "MAP", "MATCH", "MAX", "MAXVALUE", "MESSAGE_LENGTH", "MESSAGE_OCTET_LENGTH", "MESSAGE_TEXT", "METHOD", "MIN", "MINUTE", "MINVALUE", "MOD", "MODE", "MODIFIES", "MODIFY", "MODULE", "MONTH", "MORE", "MOVE", "MUMPS", "NAMES", "NATIONAL", "NATURAL", "NCHAR", "NCLOB", "NEW", "NEXT", "NO", "NOCREATEDB", "NOCREATEUSER", "NONE", "NOT", "NOTHING", "NOTIFY", "NOTNULL", "NULL", "NULLABLE", "NULLIF", "NUMBER", "NUMERIC", "OBJECT", "OCTET_LENGTH", "OF", "OFF", "OFFSET", "OIDS", "OLD", "ON", "ONLY", "OPEN", "OPERATOR", "OPTION", "OPTIONS", "OR", "ORDER", "ORDINALITY", "OUT", "OUTER", "OUTPUT", "OVERLAPS", "OVERLAY", "OVERRIDING", "OWNER", "PAD", "PARAMETER", "PARAMETERS", "PARAMETER_MODE", "PARAMETER_NAME", "PARAMETER_ORDINAL_POSITION", "PARAMETER_SPECIFIC_CATALOG", "PARAMETER_SPECIFIC_NAME", "PARAMETER_SPECIFIC_SCHEMA", "PARTIAL", "PASCAL", "PASSWORD", "PATH", "PENDANT", "PLACING", "PLI", "POSITION", "POSTFIX", "PRECISION", "PREFIX", "PREORDER", "PREPARE", "PRESERVE", "PRIMARY", "PRIOR", "PRIVILEGES", "PROCEDURAL", "PROCEDURE", "PUBLIC", "READ", "READS", "REAL", "RECHECK", "RECURSIVE", "REF", "REFERENCES", "REFERENCING", "REINDEX", "RELATIVE", "RENAME", "REPEATABLE", "REPLACE", "RESET", "RESTRICT", "RESULT", "RETURN", "RETURNED_LENGTH", "RETURNED_OCTET_LENGTH", "RETURNED_SQLSTATE", "RETURNS", "REVOKE", "RIGHT", "ROLE", "ROLLBACK", "ROLLUP", "ROUTINE", "ROUTINE_CATALOG", "ROUTINE_NAME", "ROUTINE_SCHEMA", "ROW", "ROWS", "ROW_COUNT", "RULE", "SAVEPOINT", "SCALE", "SCHEMA", "SCHEMA_NAME", "SCOPE", "SCROLL", "SEARCH", "SECOND", "SECTION", "SECURITY", "SELECT", "SELF", "SENSITIVE", "SEQUENCE", "SERIALIZABLE", "SERVER_NAME", "SESSION", "SESSION_USER", "SET", "SETOF", "SETS", "SHARE", "SHOW", "SIMILAR", "SIMPLE", "SIZE", "SMALLINT", "SOME", "SOURCE", "SPACE", "SPECIFIC", "SPECIFICTYPE", "SPECIFIC_NAME", "SQL", "SQLCODE", "SQLERROR", "SQLEXCEPTION", "SQLSTATE", "SQLWARNING", "STABLE", "START", "STATE", "STATEMENT", "STATIC", "STATISTICS", "STDIN", "STDOUT", "STORAGE", "STRICT", "STRUCTURE", "STYLE", "SUBCLASS_ORIGIN", "SUBLIST", "SUBSTRING", "SUM", "SYMMETRIC", "SYSID", "SYSTEM", "SYSTEM_USER", "TABLE", "TABLE_NAME", "TEMP", "TEMPLATE", "TEMPORARY", "TERMINATE", "THAN", "THEN", "TIME", "TIMESTAMP", "TIMEZONE_HOUR", "TIMEZONE_MINUTE", "TO", "TOAST", "TRAILING", "TRANSACTION", "TRANSACTIONS_COMMITTED", "TRANSACTIONS_ROLLED_BACK", "TRANSACTION_ACTIVE", "TRANSFORM", "TRANSFORMS", "TRANSLATE", "TRANSLATION", "TREAT", "TRIGGER", "TRIGGER_CATALOG", "TRIGGER_NAME", "TRIGGER_SCHEMA", "TRIM", "TRUE", "TRUNCATE", "TRUSTED", "TYPE", "UNCOMMITTED", "UNDER", "UNENCRYPTED", "UNION", "UNIQUE", "UNKNOWN", "UNLISTEN", "UNNAMED", "UNNEST", "UNTIL", "UPDATE", "UPPER", "USAGE", "USER", "USER_DEFINED_TYPE_CATALOG", "USER_DEFINED_TYPE_NAME", "USER_DEFINED_TYPE_SCHEMA", "USING", "VACUUM", "VALID", "VALIDATOR", "VALUE", "VALUES", "VARCHAR", "VARIABLE", "VARYING", "VERBOSE", "VERSION", "VIEW", "VOLATILE", "WHEN", "WHENEVER", "WHERE", "WITH", "WITHOUT", "WORK", "WRITE", "YEAR", "ZONE"];

var reservedWords_Cassandra = ["ADD", "ALL", "ALTER", "AND", "ANY", "APPLY", "AS", "ASC", "ASCII", "AUTHORIZE", "BATCH", "BEGIN", "BIGINT", "BLOB", "BOOLEAN", "BY", "CLUSTERING", "COLUMNFAMILY", "COMPACT", "CONSISTENCY", "COUNT", "COUNTER", "CREATE", "DECIMAL", "DELETE", "DESC", "DOUBLE", "DROP", "EACH_QUORUM", "FLOAT", "FROM", "GRANT", "IN", "INDEX", "CUSTOM", "INSERT", "INT", "INTO", "KEY", "KEYSPACE", "LEVEL", "LIMIT", "LOCAL_ONE", "LOCAL_QUORUM", "MODIFY", "NORECURSIVE", "NOSUPERUSER", "OF", "ON", "ONE", "ORDER", "PASSWORD", "PERMISSION", "PERMISSIONS", "PRIMARY", "QUORUM", "REVOKE", "SCHEMA", "SELECT", "SET", "STORAGE", "SUPERUSER", "TABLE", "TEXT", "TIMESTAMP", "TIMEUUID", "THREE", "TOKEN", "TRUNCATE", "TTL", "TWO", "TYPE", "UPDATE", "USE", "USER", "USERS", "USING", "UUID", "VALUES", "VARCHAR", "VARINT", "WHERE", "WITH", "WRITETIME", "DISTINCT", "BYTE", "SMALLINT", "COMPLEX", "ENUM", "DATE", "INTERVAL", "MACADDR", "BITSTRING"];

var EntityGenerator = module.exports = function EntityGenerator(args, options, config) {
    yeoman.generators.NamedBase.apply(this, arguments);
    this.useConfigurationFile =false;
    this.env.options.appPath = this.config.get('appPath') || 'src/main/webapp';
    this.baseName = this.config.get('baseName');
    this.packageName = this.config.get('packageName');
    this.packageFolder = this.config.get('packageFolder');
    this.javaVersion = this.config.get('javaVersion');
    this.authenticationType = this.config.get('authenticationType');
    this.hibernateCache = this.config.get('hibernateCache');
    this.databaseType = this.config.get('databaseType');
    databaseType = this.databaseType;
    this.prodDatabaseType = this.config.get('prodDatabaseType');
    this.searchEngine = this.config.get('searchEngine');
    prodDatabaseType = this.prodDatabaseType;
    this.angularAppName = _s.camelize(_s.slugify(this.baseName)) + 'App';
    this.jhipsterConfigDirectory = '.jhipster';
    this.filename = this.jhipsterConfigDirectory + '/' + _s.capitalize(this.name) + '.json';
    if (shelljs.test('-f', this.filename)) {
        console.log(chalk.green('Found the ' + this.filename + ' configuration file, automatically generating the entity'));
        try {
            this.fileData = JSON.parse(this.readFileAsString(this.filename))
        } catch (err) {
            console.log(chalk.red('The configuration file could not be read!'));
            return;
        }
        this.useConfigurationFile = true;
    }
    if (!(/^([a-zA-Z0-9_]*)$/.test(this.name))) {
        console.log(chalk.red('The entity name cannot contain special characters'));
        throw new Error("Validation error");
    } else if (this.name == '') {
        console.log(chalk.red('The entity name cannot be empty'));
        throw new Error("Validation error");
    } else if (this.name.indexOf("Detail", this.name.length - "Detail".length) !== -1) {
        console.log(chalk.red('The entity name cannot end with \'Detail\''));
        throw new Error("Validation error");
    } else if (reservedWords_Java.indexOf(this.name.toUpperCase()) != -1) {
        console.log(chalk.red('The entity name cannot contain a Java reserved keyword'));
        throw new Error("Validation error");
    } else if (prodDatabaseType == 'mysql' && reservedWords_MySQL.indexOf(this.name.toUpperCase()) != -1) {
        console.log(chalk.red('The entity name cannot contain a MySQL reserved keyword'));
        throw new Error("Validation error");
    } else if (prodDatabaseType == 'postgresql' && reservedWords_Postgresql.indexOf(this.name.toUpperCase()) != -1) {
        console.log(chalk.red('The entity name cannot contain a PostgreSQL reserved keyword'));
        throw new Error("Validation error");
    } else if (prodDatabaseType == 'cassandra' && reservedWords_Cassandra.indexOf(this.name.toUpperCase()) != -1) {
        console.log(chalk.red('The entity name cannot contain a Cassandra reserved keyword'));
        throw new Error("Validation error");
    }

    console.log(chalk.red('The entity ' + this.name + ' is being created.'));
    // Specific Entity sub-generator variables
    this.fieldId = 0;
    this.fields = [];
    this.fieldsContainDate = false; // Java 8 Date
    this.fieldsContainLocalDate = false; // JodaTime
    this.fieldsContainDateTime = false; // JodaTime
    this.fieldsContainCustomTime = false;
    this.fieldsContainBigDecimal = false;
    this.fieldsContainOwnerManyToMany = false;
    this.fieldsContainOneToMany = false;
    this.relationshipId = 0;
    this.relationships = [];
    this.pagination = 'no';
    this.validation = false;
};

var fieldNamesUnderscored = ['id'];
var databaseType;
var prodDatabaseType;

util.inherits(EntityGenerator, yeoman.generators.Base);
util.inherits(EntityGenerator, scriptBase);

EntityGenerator.prototype.askForFields = function askForFields() {
    if (this.useConfigurationFile == true) {// don't prompt if data are imported from a file
        return;
    }
    var cb = this.async();
    this.fieldId++;
    console.log(chalk.green('Generating field #' + this.fieldId));
    var prompts = [
        {
            type: 'confirm',
            name: 'fieldAdd',
            message: 'Do you want to add a field to your entity?',
            default: true
        },
        {
            when: function (response) {
                return response.fieldAdd == true;
            },
            type: 'input',
            name: 'fieldName',
            validate: function (input) {
                if (!(/^([a-zA-Z0-9_]*)$/.test(input))) {
                    return 'Your field name cannot contain special characters';
                } else if (input == '') {
                    return 'Your field name cannot be empty';
                } else if (input.charAt(0) == input.charAt(0).toUpperCase()) {
                    return 'Your field name cannot start with a upper case letter';
                } else if (input == 'id' || fieldNamesUnderscored.indexOf(_s.underscored(input)) != -1) {
                    return 'Your field name cannot use an already existing field name';
                } else if (reservedWords_Java.indexOf(input.toUpperCase()) != -1) {
                    return 'Your field name cannot contain a Java reserved keyword';
                } else if (prodDatabaseType == 'mysql' && reservedWords_MySQL.indexOf(input.toUpperCase()) != -1) {
                    return 'Your field name cannot contain a MySQL reserved keyword';
                } else if (prodDatabaseType == 'postgresql' && reservedWords_Postgresql.indexOf(input.toUpperCase()) != -1) {
                    return 'Your field name cannot contain a PostgreSQL reserved keyword';
                } else if (prodDatabaseType == 'cassandra' && reservedWords_Cassandra.indexOf(input.toUpperCase()) != -1) {
                    return 'Your field name cannot contain a Cassandra reserved keyword';
                }
                return true;
            },
            message: 'What is the name of your field?'
        },
        {
            when: function (response) {
                return response.fieldAdd == true && (databaseType == 'sql' || databaseType == 'mongodb');
            },
            type: 'list',
            name: 'fieldType',
            message: 'What is the type of your field?',
            choices: [
                {
                    value: 'String',
                    name: 'String'
                },
                {
                    value: 'Integer',
                    name: 'Integer'
                },
                {
                    value: 'Long',
                    name: 'Long'
                },
                {
                    value: 'BigDecimal',
                    name: 'BigDecimal'
                },
                {
                    value: 'LocalDate',
                    name: 'LocalDate'
                },
                {
                    value: 'DateTime',
                    name: 'DateTime'
                },
                {
                    value: 'Boolean',
                    name: 'Boolean'
                }
            ],
            default: 0
        },
        {
            when: function (response) {
                return response.fieldAdd == true && databaseType == 'cassandra';
            },
            type: 'list',
            name: 'fieldType',
            message: 'What is the type of your field?',
            choices: [
                {
                    value: 'UUID',
                    name: 'UUID'
                },
                {
                    value: 'TimeUUID',
                    name: 'TimeUUID'
                },
                {
                    value: 'String',
                    name: 'String'
                },
                {
                    value: 'Integer',
                    name: 'Integer'
                },
                {
                    value: 'Long',
                    name: 'Long'
                },
                {
                    value: 'BigDecimal',
                    name: 'BigDecimal'
                },
                {
                    value: 'Date',
                    name: 'Date'
                },
                {
                    value: 'Boolean',
                    name: 'Boolean'
                }
            ],
            default: 0
        },
        {
            when: function (response) {
                if (response.fieldType == 'Boolean') {
                    response.fieldValidate = false;
                    return false;
                }
                return response.fieldAdd == true;
            },
            type: 'confirm',
            name: 'fieldValidate',
            message: 'Do you want to add validation rules to your field?',
            default: false
        },
        {
            when: function (response) {
                return response.fieldAdd == true &&
                    response.fieldValidate == true &&
                    response.fieldType == 'String';
            },
            type: 'checkbox',
            name: 'fieldValidateRules',
            message: 'Which validation rules do you want to add?',
            choices: [
                {name: 'Required', value: 'required'},
                {name: 'Minimum length', value: 'minlength'},
                {name: 'Maximum length', value: 'maxlength'},
                {name: 'Regular expression pattern', value: 'pattern'}
            ],
            default: 0
        },
        {
            when: function (response) {
                return response.fieldAdd == true &&
                    response.fieldValidate == true &&
                    (response.fieldType == 'Integer' ||
                    response.fieldType == 'Long' ||
                    response.fieldType == 'BigDecimal');
            },
            type: 'checkbox',
            name: 'fieldValidateRules',
            message: 'Which validation rules do you want to add?',
            choices: [
                {name: 'Required', value: 'required'},
                {name: 'Minimum size', value: 'min'},
                {name: 'Maximum size', value: 'max'}
            ],
            default: 0
        },
        {
            when: function (response) {
                return response.fieldAdd == true &&
                    response.fieldValidate == true &&
                    (response.fieldType == 'LocalDate' ||
                    response.fieldType == 'DateTime' ||
                    response.fieldType == 'UUID' ||
                    response.fieldType == 'TimeUUID');
            },
            type: 'checkbox',
            name: 'fieldValidateRules',
            message: 'Which validation rules do you want to add?',
            choices: [
                {name: 'Required', value: 'required'}
            ],
            default: 0
        },
        {
            when: function (response) {
                return response.fieldAdd == true &&
                    response.fieldValidate == true &&
                    response.fieldValidateRules.indexOf('minlength') != -1;
            },
            type: 'input',
            name: 'fieldValidateRulesMinlength',
            validate: function (input) {
                if (/^([0-9]*)$/.test(input)) return true;
                return 'Minimum length must be a number';
            },
            message: 'What is the minimum length of your field?',
            default: 0
        },
        {
            when: function (response) {
                return response.fieldAdd == true &&
                    response.fieldValidate == true &&
                    response.fieldValidateRules.indexOf('maxlength') != -1;
            },
            type: 'input',
            name: 'fieldValidateRulesMaxlength',
            validate: function (input) {
                if (/^([0-9]*)$/.test(input)) return true;
                return 'Maximum length must be a number';
            },
            message: 'What is the maximum length of your field?',
            default: 20
        },
        {
            when: function (response) {
                return response.fieldAdd == true &&
                    response.fieldValidate == true &&
                    response.fieldValidateRules.indexOf('pattern') != -1;
            },
            type: 'input',
            name: 'fieldValidateRulesPattern',
            message: 'What is the regular expression pattern you want to apply on your field?',
            default: '^[a-zA-Z0-9]*$'
        },
        {
            when: function (response) {
                return response.fieldAdd == true &&
                    response.fieldValidate == true &&
                    response.fieldValidateRules.indexOf('min') != -1 &&
                    (response.fieldType == 'Integer' ||
                    response.fieldType == 'Long' ||
                    response.fieldType == 'BigDecimal');
            },
            type: 'input',
            name: 'fieldValidateRulesMin',
            message: 'What is the minimum size of your field?',
            validate: function (input) {
                if (/^([0-9]*)$/.test(input)) return true;
                return 'Minimum size must be a number';
            },
            default: 0
        },
        {
            when: function (response) {
                return response.fieldAdd == true &&
                    response.fieldValidate == true &&
                    response.fieldValidateRules.indexOf('max') != -1 &&
                    (response.fieldType == 'Integer' ||
                    response.fieldType == 'Long' ||
                    response.fieldType == 'BigDecimal');
            },
            type: 'input',
            name: 'fieldValidateRulesMax',
            message: 'What is the maximum size of your field?',
            validate: function (input) {
                if (/^([0-9]*)$/.test(input)) return true;
                return 'Maximum size must be a number';
            },
            default: 100
        }
    ];
    this.prompt(prompts, function (props) {
        if (props.fieldAdd) {

            // Handle the specific case when the second letter is capitalized
            // See http://stackoverflow.com/questions/2948083/naming-convention-for-getters-setters-in-java
            var fieldInJavaBeanMethod = props.fieldName;
            if (fieldInJavaBeanMethod.length > 1) {
                var firstLetter = fieldInJavaBeanMethod.charAt(0);
                var secondLetter = fieldInJavaBeanMethod.charAt(1);
                if (firstLetter == firstLetter.toLowerCase() && secondLetter == secondLetter.toUpperCase()) {
                    fieldInJavaBeanMethod  = firstLetter.toLowerCase() + fieldInJavaBeanMethod.slice(1);
                } else {
                    fieldInJavaBeanMethod = _s.capitalize(props.fieldName);
                }
            } else {
                fieldInJavaBeanMethod = _s.capitalize(props.fieldName);
            }

            var field = {fieldId: this.fieldId,
                fieldName: props.fieldName,
                fieldType: props.fieldType,
                fieldNameCapitalized: _s.capitalize(props.fieldName),
                fieldNameUnderscored: _s.underscored(props.fieldName),
                fieldInJavaBeanMethod: fieldInJavaBeanMethod,
                fieldValidate: props.fieldValidate,
                fieldValidateRules: props.fieldValidateRules,
                fieldValidateRulesMinlength: props.fieldValidateRulesMinlength,
                fieldValidateRulesMaxlength: props.fieldValidateRulesMaxlength,
                fieldValidateRulesPattern: props.fieldValidateRulesPattern,
                fieldValidateRulesMin: props.fieldValidateRulesMin,
                fieldValidateRulesMax: props.fieldValidateRulesMax
                }

            fieldNamesUnderscored.push(_s.underscored(props.fieldName));
            this.fields.push(field);
            if (props.fieldType == 'LocalDate') {
                this.fieldsContainLocalDate = true;
                this.fieldsContainCustomTime = true;
            }
            if (props.fieldType == 'BigDecimal') {
                this.fieldsContainBigDecimal = true;
            }
            if (props.fieldType == 'DateTime') {
                this.fieldsContainDateTime = true;
                this.fieldsContainCustomTime = true;
            }
            if (props.fieldType == 'Date') {
                this.fieldsContainDate = true;
                this.fieldsContainCustomTime = true;
            }
            if (props.fieldValidate) {
                this.validation = true;
            }
        }
        console.log(chalk.red('=================' + _s.capitalize(this.name) + '================='));
        for (var id in this.fields) {
            var validationDetails = '';
            if (this.fields[id].fieldValidate == true) {
                if (this.fields[id].fieldValidateRules.indexOf('required') != -1) {
                    validationDetails = 'required ';
                }
                if (this.fields[id].fieldValidateRules.indexOf('minlength') != -1) {
                    validationDetails += 'minlength=\'' + this.fields[id].fieldValidateRulesMinlength + '\' ';
                }
                if (this.fields[id].fieldValidateRules.indexOf('maxlength') != -1) {
                    validationDetails += 'maxlength=\'' + this.fields[id].fieldValidateRulesMaxlength + '\' ';
                }
                if (this.fields[id].fieldValidateRules.indexOf('pattern') != -1) {
                    validationDetails += 'pattern=\'' + this.fields[id].fieldValidateRulesPattern + '\' ';
                }
                if (this.fields[id].fieldValidateRules.indexOf('min') != -1) {
                    validationDetails += 'min=\'' + this.fields[id].fieldValidateRulesMin + '\' ';
                }
                if (this.fields[id].fieldValidateRules.indexOf('max') != -1) {
                    validationDetails += 'max=\'' + this.fields[id].fieldValidateRulesMax + '\' ';
                }
            }
            console.log(chalk.red(this.fields[id].fieldName) + chalk.white(' (' + this.fields[id].fieldType + ') ') + chalk.cyan(validationDetails));
        }
        if (props.fieldAdd) {
            this.askForFields();
        } else {
            cb();
        }
    }.bind(this));
};

EntityGenerator.prototype.askForRelationships = function askForRelationships() {
    if (this.useConfigurationFile == true) { // don't prompt if data are imported from a file
        return;
    }
    if (this.databaseType == 'mongodb' || this.databaseType == 'cassandra') {
        return;
    }
    var packageFolder = this.packageFolder;
    var name = this.name;
    var cb = this.async();
    this.relationshipId++;
    console.log(chalk.green('Generating relationships with other entities'));
    var prompts = [
        {
            type: 'confirm',
            name: 'relationshipAdd',
            message: 'Do you want to add a relationship to another entity?',
            default: true
        },
        {
            when: function (response) {
                return response.relationshipAdd == true;
            },
            type: 'input',
            name: 'otherEntityName',
            validate: function (input) {
                if (!(/^([a-zA-Z0-9_]*)$/.test(input))) {
                    return 'Your other entity name cannot contain special characters';
                } else if (input == '') {
                    return 'Your other entity name cannot be empty';
                } else if (reservedWords_Java.indexOf(input.toUpperCase()) != -1) {
                    return 'Your other entity name cannot contain a Java reserved keyword';
                } else if (prodDatabaseType == 'mysql' && reservedWords_MySQL.indexOf(input.toUpperCase()) != -1) {
                    return 'Your other entity name cannot contain a MySQL reserved keyword';
                } else if (input != 'user' && prodDatabaseType == 'postgresql' && reservedWords_Postgresql.indexOf(input.toUpperCase()) != -1) {
                    return 'Your other entity name cannot contain a PostgreSQL reserved keyword';
                } else if (prodDatabaseType == 'cassandra' && reservedWords_Cassandra.indexOf(input.toUpperCase()) != -1) {
                    return 'Your other entity name cannot contain a Cassandra reserved keyword';
                }
                return true;
            },
            message: 'What is the name of the other entity?'
        },
        {
            when: function (response) {
                return response.relationshipAdd == true;
            },
            type: 'input',
            name: 'relationshipName',
            validate: function (input) {
                if (!(/^([a-zA-Z0-9_]*)$/.test(input))) {
                    return 'Your relationship cannot contain special characters';
                } else if (input == '') {
                    return 'Your relationship cannot be empty';
                } else if (input == 'id' || fieldNamesUnderscored.indexOf(_s.underscored(input)) != -1) {
                    return 'Your relationship cannot use an already existing field name';
                } else if (reservedWords_Java.indexOf(input.toUpperCase()) != -1) {
                    return 'Your relationship cannot contain a Java reserved keyword';
                } else if (prodDatabaseType == 'mysql' && reservedWords_MySQL.indexOf(input.toUpperCase()) != -1) {
                    return 'Your relationship cannot contain a MySQL reserved keyword';
                } else if (input != 'user' && prodDatabaseType == 'postgresql' && reservedWords_Postgresql.indexOf(input.toUpperCase()) != -1) {
                    return 'Your relationship cannot contain a PostgreSQL reserved keyword';
                } else if (prodDatabaseType == 'cassandra' && reservedWords_Cassandra.indexOf(input.toUpperCase()) != -1) {
                    return 'Your relationship cannot contain a Cassandra reserved keyword';
                }
                return true;
            },
            message: 'What is the name of the relationship?',
            default: function (response) {
                 return response.otherEntityName;
            }
        },
        {
            when: function (response) {
                return response.relationshipAdd == true;
            },
            type: 'list',
            name: 'relationshipType',
            message: 'What is the type of the relationship?',
            choices: [
                {
                    value: 'one-to-many',
                    name: 'one-to-many'
                },
                {
                    value: 'many-to-one',
                    name: 'many-to-one'
                },
                {
                    value: 'many-to-many',
                    name: 'many-to-many'
                },
                {
                    value: 'one-to-one',
                    name: 'one-to-one'
                }
            ],
            default: 0
        },
        {
            when: function(response) {
                return (response.relationshipAdd == true && response.relationshipType == 'many-to-one' && !shelljs.test('-f', 'src/main/java/' + packageFolder + '/domain/' + _s.capitalize(response.otherEntityName) + '.java'))
            },
            type: 'confirm',
            name: 'noOtherEntity',
            message: 'WARNING! You are trying to generate a many-to-one relationship on an entity that does not exist. This will probably fail, as you will need to create a foreign key on a table that does not exist. We advise you to create the other side of this relationship first (do the one-to-many before the many-to-one relationship). Are you sure you want to continue?',
            default: false
        },
        {
            when: function (response) {
                return (response.relationshipAdd == true && (response.relationshipType == 'many-to-many' || response.relationshipType == 'one-to-one'));
            },
            type: 'confirm',
            name: 'ownerSide',
            message: 'Is this entity the owner of the relationship?',
            default: false
        },
        {
            when: function (response) {
                return (response.relationshipAdd == true && (response.relationshipType == 'one-to-many' ||
                    (response.relationshipType == 'many-to-many' && response.ownerSide == false) ||
                    (response.relationshipType == 'one-to-one' && response.ownerSide == false)));
            },
            type: 'input',
            name: 'mappedBy',
            message: 'What field is used on the other entity to map this entity?',
            default: function (response) {
                 return name.charAt(0).toLowerCase() + name.slice(1);
            }
        },
        {
            when: function(response) {
                return (response.relationshipAdd == true && response.ownerSide == true && !shelljs.test('-f', 'src/main/java/' + packageFolder + '/domain/' + _s.capitalize(response.otherEntityName) + '.java'))
            },
            type: 'confirm',
            name: 'noOtherEntity2',
            message: 'WARNING! You have selected that this entity is the owner of a relationship on another entity, that does not exist yet. This will probably fail, as you will need to create a foreign key on a table that does not exist. We advise you to create the other side of this relationship first (do the non-owning side before the owning side). Are you sure you want to continue?',
            default: false
        },
        {
            when: function (response) {
                return (!(response.noOtherEntity == false || response.noOtherEntity2 == false) && response.relationshipAdd == true && (response.relationshipType == 'many-to-one' || (response.relationshipType == 'many-to-many' && response.ownerSide == true)));
            },
            type: 'input',
            name: 'otherEntityField',
            message: function (response) {
                return 'When you display this relationship with AngularJS, which field from \'' + response.otherEntityName + '\' do you want to use?'
            },
            default: 'id'
        }
    ];
    this.prompt(prompts, function (props) {
        if (props.noOtherEntity == false || props.noOtherEntity2 == false) {
            console.log(chalk.red('Generation aborted, as requested by the user.'));
            return;
        }
        if (props.relationshipAdd) {
            var relationship = {relationshipId: this.relationshipId,
                relationshipName: props.relationshipName,
                relationshipNameCapitalized: _s.capitalize(props.relationshipName),
                relationshipFieldName: props.relationshipName.charAt(0).toLowerCase() + props.relationshipName.slice(1),
                otherEntityName: props.otherEntityName.charAt(0).toLowerCase() + props.otherEntityName.slice(1),
                relationshipType: props.relationshipType,
                otherEntityNameCapitalized: _s.capitalize(props.otherEntityName),
                otherEntityField: props.otherEntityField,
                ownerSide: props.ownerSide,
                mappedBy: props.mappedBy
            }
            if (props.relationshipType == 'many-to-many' && props.ownerSide == true) {
                this.fieldsContainOwnerManyToMany = true;
            }
            if (props.relationshipType == 'one-to-many') {
                this.fieldsContainOneToMany = true;
            }
            fieldNamesUnderscored.push(_s.underscored(props.relationshipName));
            this.relationships.push(relationship);
        }
        console.log(chalk.red('===========' + _s.capitalize(this.name) + '=============='));
        for (var id in this.fields) {
            console.log(chalk.red(this.fields[id].fieldName + ' (' + this.fields[id].fieldType + ')'));
        }
        console.log(chalk.red('-------------------'));
        for (var id in this.relationships) {
            console.log(chalk.red(this.relationships[id].relationshipName + ' - ' + this.relationships[id].otherEntityName + ' (' + this.relationships[id].relationshipType + ')'));
        }
        if (props.relationshipAdd) {
            this.askForRelationships();
        } else {
            cb();
        }
    }.bind(this));
};

EntityGenerator.prototype.askForPagination = function askForPagination() {
    if (this.useConfigurationFile == true) { // don't prompt if data are imported from a file
        return;
    }
    if (this.databaseType == 'cassandra') {
        return;
    }
    var cb = this.async();
    var prompts = [
        {
            type: 'list',
            name: 'pagination',
            message: 'Do you want pagination on your entity?',
            choices: [
                {
                    value: 'no',
                    name: 'No'
                },
                {
                    value: 'pager',
                    name: 'Yes, with a simple pager'
                },
                {
                    value: 'pagination',
                    name: 'Yes, with pagination links'
                },
                {
                    value: 'infinite-scroll',
                    name: 'Yes, with infinite scroll'
                }
            ],
            default: 0
        }
    ];
    this.prompt(prompts, function (props) {
        this.pagination = props.pagination;
        console.log(chalk.green('Everything is configured, generating the entity...'));
        cb();
    }.bind(this));
};


EntityGenerator.prototype.files = function files() {
    if (this.databaseType == "sql" || this.databaseType == "cassandra") {
        this.changelogDate = this.dateFormatForLiquibase();
    }
    if (this.useConfigurationFile == false) { // store informations in a file for further use.
        this.data = {};
        this.data.relationships = this.relationships;
        this.data.fields = this.fields;
        this.data.fieldNamesUnderscored = this.fieldNamesUnderscored;
        this.data.fieldsContainOwnerManyToMany = this.fieldsContainOwnerManyToMany;
        this.data.fieldsContainOneToMany = this.fieldsContainOneToMany;
        this.data.fieldsContainLocalDate = this.fieldsContainLocalDate;
        this.data.fieldsContainCustomTime = this.fieldsContainCustomTime;
        this.data.fieldsContainBigDecimal = this.fieldsContainBigDecimal;
        this.data.fieldsContainDateTime = this.fieldsContainDateTime;
        this.data.fieldsContainDate = this.fieldsContainDate;
        this.data.changelogDate = this.changelogDate;
        this.data.pagination = this.pagination;
        this.data.validation = this.validation;
        this.write(this.filename, JSON.stringify(this.data, null, 4));
    } else  {
        this.relationships = this.fileData.relationships;
        for (var relationshipIdx in this.relationships) {
            var relationship = this.relationships[relationshipIdx];
            if (relationship.mappedBy == null) {
                relationship.mappedBy = this.name.charAt(0).toLowerCase() + this.name.slice(1);
            }
        }
        this.fields = this.fileData.fields;
        for (var fieldIdx in this.fields) {
            var field = this.fields[fieldIdx];
            if (field.fieldInJavaBeanMethod == null) {
                field.fieldInJavaBeanMethod = _s.capitalize(field.fieldName);
            }
        }
        this.fieldNamesUnderscored = this.fileData.fieldNamesUnderscored;
        this.fieldsContainOwnerManyToMany = this.fileData.fieldsContainOwnerManyToMany;
        this.fieldsContainOneToMany = this.fileData.fieldsContainOneToMany;
        this.fieldsContainLocalDate = this.fileData.fieldsContainLocalDate;
        this.fieldsContainCustomTime = this.fileData.fieldsContainCustomTime;
        this.fieldsContainBigDecimal = this.fileData.fieldsContainBigDecimal;
        this.fieldsContainDateTime = this.fileData.fieldsContainDateTime;
        this.fieldsContainDate = this.fileData.fieldsContainDate;
        this.changelogDate = this.fileData.changelogDate;
        for (var idx in this.relationships) {
          var rel = this.relationships[idx];
          rel.relationshipName = rel.relationshipName || rel.otherEntityName;
          rel.relationshipNameCapitalized = rel.relationshipNameCapitalized || _s.capitalize(rel.relationshipName);
          rel.relationshipFieldName = rel.relationshipFieldName || rel.relationshipName.charAt(0).toLowerCase() + rel.relationshipName.slice(1);
        }
        this.pagination = this.fileData.pagination;
        if (this.pagination == undefined) {
            this.pagination = 'no';
        }
        this.validation = this.fileData.validation;
        if (this.validation == undefined) {
            this.validation = false;
        }
    }
    this.entityClass = _s.capitalize(this.name);
    this.entityInstance = this.name.charAt(0).toLowerCase() + this.name.slice(1);

    this.differentTypes = [this.entityClass];
    var relationshipId;
    for (relationshipId in this.relationships) {
      var entityType = this.relationships[relationshipId].otherEntityNameCapitalized;
      if (this.differentTypes.indexOf(entityType) == -1) {
        this.differentTypes.push(entityType);
      }
    }

    var insight = this.insight();
    insight.track('generator', 'entity');
    insight.track('entity/fields', this.fields.length);
    insight.track('entity/relationships', this.relationships.length);
    insight.track('entity/pagination', this.pagination);

    var resourceDir = 'src/main/resources/';

    this.template('src/main/java/package/domain/_Entity.java',
        'src/main/java/' + this.packageFolder + '/domain/' +    this.entityClass + '.java', this, {});

    this.template('src/main/java/package/repository/_EntityRepository.java',
        'src/main/java/' + this.packageFolder + '/repository/' +    this.entityClass + 'Repository.java', this, {});

    if (this.searchEngine == 'elasticsearch') {
        this.template('src/main/java/package/repository/search/_EntitySearchRepository.java',
            'src/main/java/' + this.packageFolder + '/repository/search/' +    this.entityClass + 'SearchRepository.java', this, {});
    }

    this.template('src/main/java/package/web/rest/_EntityResource.java',
        'src/main/java/' + this.packageFolder + '/web/rest/' +    this.entityClass + 'Resource.java', this, {});

    if (this.databaseType == "sql") {
        this.template(resourceDir + '/config/liquibase/changelog/_added_entity.xml',
            resourceDir + 'config/liquibase/changelog/' + this.changelogDate + '_added_entity_' + this.entityClass + '.xml', this, {});

        this.addChangelogToLiquibase(this.changelogDate + '_added_entity_' + this.entityClass);
    }
    if (this.databaseType == "cassandra") {
        this.template(resourceDir + '/config/cql/_added_entity.cql',
            resourceDir + 'config/cql/' + this.changelogDate + '_added_entity_' + this.entityClass + '.cql', this, {});
    }

    this.template('src/main/webapp/app/_entities.html',
        'src/main/webapp/scripts/app/entities/' +    this.entityInstance  + '/' + this.entityInstance + 's.html', this, {});
    this.template('src/main/webapp/app/_entity-detail.html',
        'src/main/webapp/scripts/app/entities/' +    this.entityInstance  + '/' + this.entityInstance + '-detail.html', this, {});

    this.addRouterToMenu(this.entityInstance);

    this.template('src/main/webapp/app/_entity.js',
        'src/main/webapp/scripts/app/entities/' +    this.entityInstance + '/' + this.entityInstance + '.js', this, {});
    this.addAppScriptToIndex(this.entityInstance + '/' + this.entityInstance + '.js');
    this.template('src/main/webapp/app/_entity-controller.js',
        'src/main/webapp/scripts/app/entities/' +    this.entityInstance + '/' + this.entityInstance + '.controller' + '.js', this, {});
    this.addAppScriptToIndex(this.entityInstance + '/' + this.entityInstance + '.controller' + '.js');

    this.template('src/main/webapp/app/_entity-detail-controller.js',
        'src/main/webapp/scripts/app/entities/' +    this.entityInstance + '/' + this.entityInstance + '-detail.controller' + '.js', this, {});
    this.addAppScriptToIndex(this.entityInstance + '/' + this.entityInstance + '-detail.controller' + '.js');

    this.template('src/main/webapp/components/_entity-service.js',
        'src/main/webapp/scripts/components/entities/' + this.entityInstance + '/' + this.entityInstance + '.service' + '.js', this, {});
    this.addComponentsScriptToIndex(this.entityInstance + '/' + this.entityInstance + '.service' + '.js');

    if (this.searchEngine == 'elasticsearch') {
        this.template('src/main/webapp/components/_entity-search-service.js',
            'src/main/webapp/scripts/components/entities/' + this.entityInstance + '/' + this.entityInstance + '.search.service' + '.js', this, {});
        this.addComponentsScriptToIndex(this.entityInstance + '/' + this.entityInstance + '.search.service' + '.js');
    }

    this.template('src/test/java/package/web/rest/_EntityResourceTest.java',
        'src/test/java/' + this.packageFolder + '/web/rest/' +    this.entityClass + 'ResourceTest.java', this, {});

    this.template('src/test/gatling/simulations/_EntityGatlingTest.scala',
        'src/test/gatling/simulations/' + this.entityClass + 'GatlingTest.scala', this, { 'interpolate': /<%=([\s\S]+?)%>/g });

    // Copy for each
    this.copyI18n('ca');
    this.copyI18n('zh-cn');
    this.copyI18n('zh-tw');
    this.copyI18n('da');
    this.copyI18n('de');
    this.copyI18n('en');
    this.copyI18n('fr');
    this.copyI18n('hu');
    this.copyI18n('it');
    this.copyI18n('ja');
    this.copyI18n('kr');
    this.copyI18n('pl');
    this.copyI18n('pt-br');
    this.copyI18n('ru');
    this.copyI18n('es');
    this.copyI18n('sv');
    this.copyI18n('tr');
};

EntityGenerator.prototype.copyI18n = function(language) {
    try {
        var stats = fs.lstatSync('src/main/webapp/i18n/' + language);
        if (stats.isDirectory()) {
            this.template('src/main/webapp/i18n/_entity_' + language + '.json', 'src/main/webapp/i18n/' + language + '/' + this.entityInstance + '.json', this, {});
            this.addNewEntityToMenu(language, this.entityInstance, this.entityClass);
        }
    } catch(e) {
        // An exception is thrown if the folder doesn't exist
        // do nothing
    }
};
