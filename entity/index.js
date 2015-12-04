'use strict';
var util = require('util'),
        fs = require('fs'),
        path = require('path'),
        yeoman = require('yeoman-generator'),
        chalk = require('chalk'),
        _ = require('lodash'),
        _s = require('underscore.string'),
        shelljs = require('shelljs'),
        html = require("html-wiring"),
        scriptBase = require('../script-base');

var reservedWords_Java = ["ABSTRACT", "CONTINUE", "FOR", "NEW", "SWITCH", "ASSERT", "DEFAULT", "GOTO", "PACKAGE", "SYNCHRONIZED", "BOOLEAN", "DO", "IF", "PRIVATE", "THIS", "BREAK", "DOUBLE", "IMPLEMENTS", "PROTECTED", "THROW", "BYTE", "ELSE", "IMPORT", "PUBLIC", "THROWS", "CASE", "ENUM", "INSTANCEOF", "RETURN", "TRANSIENT", "CATCH", "EXTENDS", "INT", "SHORT", "TRY", "CHAR", "FINAL", "INTERFACE", "STATIC", "VOID", "CLASS", "FINALLY", "LONG", "STRICTFP", "VOLATILE", "CONST", "FLOAT", "NATIVE", "SUPER", "WHILE"];

// The JHipster reserved keywords are only for the entity names.
// They are used to generate AngularJS routes, so we cannot create an entity using one of the JHipster default routes.
var reservedWords_JHipster = ["ADMIN", "ACCOUNT", "LOGIN", "LOGOUT", "ACTIVATE", "SETTINGS", "PASSWORD", "SESSIONS", "METRICS", "HEALTH", "CONFIGURATION", "AUDITS", "LOGS", "REGISTER", "RESET", "TEST", "LOAD"];

var reservedWords_MySQL = ["ACCESSIBLE", "ADD", "ALL", "ALTER", "ANALYZE", "AND", "AS", "ASC", "ASENSITIVE", "BEFORE", "BETWEEN", "BIGINT", "BINARY", "BLOB", "BOTH", "BY", "CALL", "CASCADE", "CASE", "CHANGE", "CHAR", "CHARACTER", "CHECK", "COLLATE", "COLUMN", "CONDITION", "CONSTRAINT", "CONTINUE", "CONVERT", "CREATE", "CROSS", "CURRENT_DATE", "CURRENT_TIME", "CURRENT_TIMESTAMP", "CURRENT_USER", "CURSOR", "DATABASE", "DATABASES", "DAY_HOUR", "DAY_MICROSECOND", "DAY_MINUTE", "DAY_SECOND", "DEC", "DECIMAL", "DECLARE", "DEFAULT", "DELAYED", "DELETE", "DESC", "DESCRIBE", "DETERMINISTIC", "DISTINCT", "DISTINCTROW", "DIV", "DOUBLE", "DROP", "DUAL", "EACH", "ELSE", "ELSEIF", "ENCLOSED", "ESCAPED", "EXISTS", "EXIT", "EXPLAIN", "FALSE", "FETCH", "FLOAT", "FLOAT4", "FLOAT8", "FOR", "FORCE", "FOREIGN", "FROM", "FULLTEXT", "GRANT", "GROUP", "HAVING", "HIGH_PRIORITY", "HOUR_MICROSECOND", "HOUR_MINUTE", "HOUR_SECOND", "IF", "IGNORE", "IN", "INDEX", "INFILE", "INNER", "INOUT", "INSENSITIVE", "INSERT", "INT", "INT1", "INT2", "INT3", "INT4", "INT8", "INTEGER", "INTERVAL", "INTO", "IS", "ITERATE", "JOIN", "KEY", "KEYS", "KILL", "LEADING", "LEAVE", "LEFT", "LIKE", "LIMIT", "LINEAR", "LINES", "LOAD", "LOCALTIME", "LOCALTIMESTAMP", "LOCK", "LONG", "LONGBLOB", "LONGTEXT", "LOOP", "LOW_PRIORITY", "MASTER_SSL_VERIFY_SERVER_CERT", "MATCH", "MAXVALUE", "MEDIUMBLOB", "MEDIUMINT", "MEDIUMTEXT", "MIDDLEINT", "MINUTE_MICROSECOND", "MINUTE_SECOND", "MOD", "MODIFIES", "NATURAL", "NOT", "NO_WRITE_TO_BINLOG", "NULL", "NUMERIC", "ON", "OPTIMIZE", "OPTION", "OPTIONALLY", "OR", "ORDER", "OUT", "OUTER", "OUTFILE", "PRECISION", "PRIMARY", "PROCEDURE", "PURGE", "RANGE", "READ", "READS", "READ_WRITE", "REAL", "REFERENCES", "REGEXP", "RELEASE", "RENAME", "REPEAT", "REPLACE", "REQUIRE", "RESIGNAL", "RESTRICT", "RETURN", "REVOKE", "RIGHT", "RLIKE", "SCHEMA", "SCHEMAS", "SECOND_MICROSECOND", "SELECT", "SENSITIVE", "SEPARATOR", "SET", "SHOW", "SIGNAL", "SMALLINT", "SPATIAL", "SPECIFIC", "SQL", "SQLEXCEPTION", "SQLSTATE", "SQLWARNING", "SQL_BIG_RESULT", "SQL_CALC_FOUND_ROWS", "SQL_SMALL_RESULT", "SSL", "STARTING", "STRAIGHT_JOIN", "TABLE", "TERMINATED", "THEN", "TINYBLOB", "TINYINT", "TINYTEXT", "TO", "TRAILING", "TRIGGER", "TRUE", "UNDO", "UNION", "UNIQUE", "UNLOCK", "UNSIGNED", "UPDATE", "USAGE", "USE", "USING", "UTC_DATE", "UTC_TIME", "UTC_TIMESTAMP", "VALUES", "VARBINARY", "VARCHAR", "VARCHARACTER", "VARYING", "WHEN", "WHERE", "WHILE", "WITH", "WRITE", "XOR", "YEAR_MONTH", "ZEROFILL", "GENERAL", "IGNORE_SERVER_IDS", "MASTER_HEARTBEAT_PERIOD", "MAXVALUE", "RESIGNAL", "SIGNAL", "SLOW"];

var reservedWords_Postgresql = ["ALL", "ANALYSE", "ANALYZE", "AND", "ANY", "ARRAY", "AS", "ASC", "ASYMMETRIC", "AUTHORIZATION", "BINARY", "BOTH", "CASE", "CAST", "CHECK", "COLLATE", "COLLATION", "COLUMN", "CONCURRENTLY",  "CONSTRAINT", "CREATE", "CROSS", "CURRENT_CATALOG", "CURRENT_DATE", "CURRENT_ROLE", "CURRENT_SCHEMA", "CURRENT_TIME", "CURRENT_TIMESTAMP", "CURRENT_USER", "DEFAULT", "DEFERRABLE", "DESC", "DISTINCT", "DO", "ELSE", "END", "EXCEPT", "FALSE", "FETCH", "FOR", "FOREIGN", "FROM", "FULL", "GRANT", "GROUP", "HAVING", "ILIKE", "IN", "INITIALLY", "INNER", "INTERSECT", "INTO", "IS", "ISNULL", "JOIN", "LATERAL", "LEADING", "LEFT", "LIKE", "LIMIT", "LOCALTIME", "LOCALTIMESTAMP", "NATURAL", "NOT", "NOTNULL", "NULL", "OFFSET", "ON", "ONLY", "OR", "ORDER", "OUTER", "OVERLAPS", "PLACING", "PRIMARY", "REFERENCES", "RETURNING", "RIGHT", "SELECT", "SESSION_USER", "SIMILAR", "SOME", "SYMMETRIC", "TABLE", "THEN", "TO", "TRAILING", "TRUE", "UNION", "UNIQUE", "USER", "USING", "VARIADIC", "VERBOSE", "WHEN", "WHERE", "WINDOW", "WITH"];

var reservedWords_Cassandra = ["ADD", "ALL", "ALTER", "AND", "ANY", "APPLY", "AS", "ASC", "ASCII", "AUTHORIZE", "BATCH", "BEGIN", "BIGINT", "BLOB", "BOOLEAN", "BY", "CLUSTERING", "COLUMNFAMILY", "COMPACT", "CONSISTENCY", "COUNT", "COUNTER", "CREATE", "DECIMAL", "DELETE", "DESC", "DOUBLE", "DROP", "EACH_QUORUM", "FLOAT", "FROM", "GRANT", "IN", "INDEX", "CUSTOM", "INSERT", "INT", "INTO", "KEY", "KEYSPACE", "LEVEL", "LIMIT", "LOCAL_ONE", "LOCAL_QUORUM", "MODIFY", "NORECURSIVE", "NOSUPERUSER", "OF", "ON", "ONE", "ORDER", "PASSWORD", "PERMISSION", "PERMISSIONS", "PRIMARY", "QUORUM", "REVOKE", "SCHEMA", "SELECT", "SET", "STORAGE", "SUPERUSER", "TABLE", "TEXT", "TIMESTAMP", "TIMEUUID", "THREE", "TOKEN", "TRUNCATE", "TTL", "TWO", "TYPE", "UPDATE", "USE", "USER", "USERS", "USING", "UUID", "VALUES", "VARCHAR", "VARINT", "WHERE", "WITH", "WRITETIME", "DISTINCT", "BYTE", "SMALLINT", "COMPLEX", "ENUM", "DATE", "INTERVAL", "MACADDR", "BITSTRING"];

var reservedWords_Oracle = ["ACCESS", "ACCOUNT", "ACTIVATE", "ADD", "ADMIN", "ADVISE", "AFTER", "ALL", "ALL_ROWS", "ALLOCATE", "ALTER", "ANALYZE", "AND", "ANY", "ARCHIVE", "ARCHIVELOG", "ARRAY", "AS", "ASC", "AT", "AUDIT", "AUTHENTICATED", "AUTHORIZATION", "AUTOEXTEND", "AUTOMATIC", "BACKUP", "BECOME", "BEFORE", "BEGIN", "BETWEEN", "BFILE", "BITMAP", "BLOB", "BLOCK", "BODY", "BY", "CACHE", "CACHE_INSTANCES", "CANCEL", "CASCADE", "CAST", "CFILE", "CHAINED", "CHANGE", "CHAR", "CHAR_CS", "CHARACTER", "CHECK", "CHECKPOINT", "CHOOSE", "CHUNK", "CLEAR", "CLOB", "CLONE", "CLOSE", "CLOSE_CACHED_OPEN_CURSORS", "CLUSTER", "COALESCE", "COLUMN", "COLUMNS", "COMMENT", "COMMIT", "COMMITTED", "COMPATIBILITY", "COMPILE", "COMPLETE", "COMPOSITE_LIMIT", "COMPRESS", "COMPUTE", "CONNECT", "CONNECT_TIME", "CONSTRAINT", "CONSTRAINTS", "CONTENTS", "CONTINUE", "CONTROLFILE", "CONVERT", "COST", "CPU_PER_CALL", "CPU_PER_SESSION", "CREATE", "CURRENT", "CURRENT_SCHEMA", "CURREN_USER", "CURSOR", "CYCLE", " ", "DANGLING", "DATABASE", "DATAFILE", "DATAFILES", "DATAOBJNO", "DATE", "DBA", "DBHIGH", "DBLOW", "DBMAC", "DEALLOCATE", "DEBUG", "DEC", "DECIMAL", "DECLARE", "DEFAULT", "DEFERRABLE", "DEFERRED", "DEGREE", "DELETE", "DEREF", "DESC", "DIRECTORY", "DISABLE", "DISCONNECT", "DISMOUNT", "DISTINCT", "DISTRIBUTED", "DML", "DOUBLE", "DROP", "DUMP", "EACH", "ELSE", "ENABLE", "END", "ENFORCE", "ENTRY", "ESCAPE", "EXCEPT", "EXCEPTIONS", "EXCHANGE", "EXCLUDING", "EXCLUSIVE", "EXECUTE", "EXISTS", "EXPIRE", "EXPLAIN", "EXTENT", "EXTENTS", "EXTERNALLY", "FAILED_LOGIN_ATTEMPTS", "FALSE", "FAST", "FILE", "FIRST_ROWS", "FLAGGER", "FLOAT", "FLOB", "FLUSH", "FOR", "FORCE", "FOREIGN", "FREELIST", "FREELISTS", "FROM", "FULL", "FUNCTION", "GLOBAL", "GLOBALLY", "GLOBAL_NAME", "GRANT", "GROUP", "GROUPS", "HASH", "HASHKEYS", "HAVING", "HEADER", "HEAP", "IDENTIFIED", "IDGENERATORS", "IDLE_TIME", "IF", "IMMEDIATE", "IN", "INCLUDING", "INCREMENT", "INDEX", "INDEXED", "INDEXES", "INDICATOR", "IND_PARTITION", "INITIAL", "INITIALLY", "INITRANS", "INSERT", "INSTANCE", "INSTANCES", "INSTEAD", "INT", "INTEGER", "INTERMEDIATE", "INTERSECT", "INTO", "IS", "ISOLATION", "ISOLATION_LEVEL", "KEEP", "KEY", "KILL", "LABEL", "LAYER", "LESS", "LEVEL", "LIBRARY", "LIKE", "LIMIT", "LINK", "LIST", "LOB", "LOCAL", "LOCK", "LOCKED", "LOG", "LOGFILE", "LOGGING", "LOGICAL_READS_PER_CALL", "LOGICAL_READS_PER_SESSION", "LONG", "MANAGE", "MASTER", "MAX", "MAXARCHLOGS", "MAXDATAFILES", "MAXEXTENTS", "MAXINSTANCES", "MAXLOGFILES", "MAXLOGHISTORY", "MAXLOGMEMBERS", "MAXSIZE", "MAXTRANS", "MAXVALUE", "MIN", "MEMBER", "MINIMUM", "MINEXTENTS", "MINUS", "MINVALUE", "MLSLABEL", "MLS_LABEL_FORMAT", "MODE", "MODIFY", "MOUNT", "MOVE", "MTS_DISPATCHERS", "MULTISET", "NATIONAL", "NCHAR", "NCHAR_CS", "NCLOB", "NEEDED", "NESTED", "NETWORK", "NEW", "NEXT", "NOARCHIVELOG", "NOAUDIT", "NOCACHE", "NOCOMPRESS", "NOCYCLE", "NOFORCE", "NOLOGGING", "NOMAXVALUE", "NOMINVALUE", "NONE", "NOORDER", "NOOVERRIDE", "NOPARALLEL", "NOPARALLEL", "NOREVERSE", "NORMAL", "NOSORT", "NOT", "NOTHING", "NOWAIT", "NULL", "NUMBER", "NUMERIC", "NVARCHAR2", "OBJECT", "OBJNO", "OBJNO_REUSE", "OF", "OFF", "OFFLINE", "OID", "OIDINDEX", "OLD", "ON", "ONLINE", "ONLY", "OPCODE", "OPEN", "OPTIMAL", "OPTIMIZER_GOAL", "OPTION", "OR", "ORDER", "ORGANIZATION", "OSLABEL", "OVERFLOW", "OWN", "PACKAGE", "PARALLEL", "PARTITION", "PASSWORD", "PASSWORD_GRACE_TIME", "PASSWORD_LIFE_TIME", "PASSWORD_LOCK_TIME", "PASSWORD_REUSE_MAX", "PASSWORD_REUSE_TIME", "PASSWORD_VERIFY_FUNCTION", "PCTFREE", "PCTINCREASE", "PCTTHRESHOLD", "PCTUSED", "PCTVERSION", "PERCENT", "PERMANENT", "PLAN", "PLSQL_DEBUG", "POST_TRANSACTION", "PRECISION", "PRESERVE", "PRIMARY", "PRIOR", "PRIVATE", "PRIVATE_SGA", "PRIVILEGE", "PRIVILEGES", "PROCEDURE", "PROFILE", "PUBLIC", "PURGE", "QUEUE", "QUOTA", "RANGE", "RAW", "RBA", "READ", "READUP", "REAL", "REBUILD", "RECOVER", "RECOVERABLE", "RECOVERY", "REF", "REFERENCES", "REFERENCING", "REFRESH", "RENAME", "REPLACE", "RESET", "RESETLOGS", "RESIZE", "RESOURCE", "RESTRICTED", "RETURN", "RETURNING", "REUSE", "REVERSE", "REVOKE", "ROLE", "ROLES", "ROLLBACK", "ROW", "ROWID", "ROWNUM", "ROWS", "RULE", "SAMPLE", "SAVEPOINT", "SB4", "SCAN_INSTANCES", "SCHEMA", "SCN", "SCOPE", "SD_ALL", "SD_INHIBIT", "SD_SHOW", "SEGMENT", "SEG_BLOCK", "SEG_FILE", "SELECT", "SEQUENCE", "SERIALIZABLE", "SESSION", "SESSION_CACHED_CURSORS", "SESSIONS_PER_USER", "SET", "SHARE", "SHARED", "SHARED_POOL", "SHRINK", "SIZE", "SKIP", "SKIP_UNUSABLE_INDEXES", "SMALLINT", "SNAPSHOT", "SOME", "SORT", "SPECIFICATION", "SPLIT", "SQL_TRACE", "STANDBY", "START", "STATEMENT_ID", "STATISTICS", "STOP", "STORAGE", "STORE", "STRUCTURE", "SUCCESSFUL", "SWITCH", "SYS_OP_ENFORCE_NOT_NULL$", "SYS_OP_NTCIMG$", "SYNONYM", "SYSDATE", "SYSDBA", "SYSOPER", "SYSTEM", "TABLE", "TABLES", "TABLESPACE", "TABLESPACE_NO", "TABNO", "TEMPORARY", "THAN", "THE", "THEN", "THREAD", "TIMESTAMP", "TIME", "TO", "TOPLEVEL", "TRACE", "TRACING", "TRANSACTION", "TRANSITIONAL", "TRIGGER", "TRIGGERS", "TRUE", "TRUNCATE", "TX", "TYPE", "UB2", "UBA", "UID", "UNARCHIVED", "UNDO", "UNION", "UNIQUE", "UNLIMITED", "UNLOCK", "UNRECOVERABLE", "UNTIL", "UNUSABLE", "UNUSED", "UPDATABLE", "UPDATE", "USAGE", "USE", "USER", "USING", "VALIDATE", "VALIDATION", "VALUE", "VALUES", "VARCHAR", "VARCHAR2", "VARYING", "VIEW", "WHEN", "WHENEVER", "WHERE", "WITH", "WITHOUT", "WORK", "WRITE", "WRITEDOWN", "WRITEUP", "XID", "YEAR", "ZONE"];

var supportedValidationRules = ['required', 'max', 'min', 'maxlength', 'minlength', 'maxbytes', 'minbytes', 'pattern'];

// enum-specific vars
var enums = [];

var existingEnum = false;

var EntityGenerator = module.exports = function EntityGenerator(args, options, config) {
    yeoman.generators.NamedBase.apply(this, arguments);
    this.useConfigurationFile =false;
    this.env.options.appPath = this.config.get('appPath') || 'src/main/webapp';
    this.baseName = this.config.get('baseName');
    this.packageName = this.config.get('packageName');
    this.packageFolder = this.config.get('packageFolder');
    this.authenticationType = this.config.get('authenticationType');
    this.hibernateCache = this.config.get('hibernateCache');
    this.databaseType = this.config.get('databaseType');
    databaseType = this.databaseType;
    this.prodDatabaseType = this.config.get('prodDatabaseType');
    this.searchEngine = this.config.get('searchEngine');
    this.enableTranslation = this.config.get('enableTranslation');
    prodDatabaseType = this.prodDatabaseType;
    this.buildTool = this.config.get('buildTool');
    this.testFrameworks = this.config.get('testFrameworks');
    // backward compatibility on testing frameworks
    if (this.testFrameworks == null) {
        this.testFrameworks = [ 'gatling' ];
    }
    this.angularAppName = _s.camelize(_s.slugify(this.baseName)) + 'App';
    this.jhipsterConfigDirectory = '.jhipster';
    this.name = this.name.replace('.json','');
    this.filename = this.jhipsterConfigDirectory + '/' + _s.capitalize(this.name) + '.json';
    if (shelljs.test('-f', this.filename)) {
        console.log(chalk.green('Found the ' + this.filename + ' configuration file, automatically generating the entity'));
        try {
            this.fileData = JSON.parse(html.readFileAsString(this.filename))
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
    } else if (reservedWords_JHipster.indexOf(this.name.toUpperCase()) != -1) {
        console.log(chalk.red('The entity name cannot contain a JHipster reserved keyword'));
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
    } else if (prodDatabaseType == 'oracle' && reservedWords_Oracle.indexOf(this.name.toUpperCase()) != -1) {
        console.log(chalk.red('The entity name cannot contain a Oracle reserved keyword'));
        throw new Error("Validation error");
    } else if (prodDatabaseType == 'oracle' && _s.underscored(this.name).length > 26) {
        console.log(chalk.red('The entity name is too long for Oracle, try a shorter name'));
        throw new Error("Validation error");
    }

    console.log(chalk.red('The entity ' + this.name + ' is being created.'));
    // Specific Entity sub-generator variables
    this.fieldId = 0;
    this.fields = [];
    this.relationshipId = 0;
    this.relationships = [];
    this.pagination = 'no';
    this.validation = false;
    this.dto = 'no';
    this.service = 'no';
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
                } else if (prodDatabaseType == 'oracle' && reservedWords_Oracle.indexOf(input.toUpperCase()) != -1) {
                    return 'Your field name cannot contain a Oracle reserved keyword';
                } else if (prodDatabaseType == 'oracle' && input.length > 30) {
                    return 'The field name cannot be of more than 30 characters';
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
                    value: 'Float',
                    name: 'Float'
                },
                {
                    value: 'Double',
                    name: 'Double'
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
                    value: 'ZonedDateTime',
                    name: 'ZonedDateTime'
                },
                {
                    value: 'Boolean',
                    name: 'Boolean'
                },
                {
                    value: 'enum',
                    name: 'Enumeration (Java enum type)'
                },
                {
                    value: 'byte[]',
                    name: '[BETA] Blob'
                }
            ],
            default: 0
        },
        {
            when: function (response) {
                if (response.fieldType == 'enum') {
                    response.fieldIsEnum = true;
                    return true;
                } else {
                    response.fieldIsEnum = false;
                    return false;
                }
            },
            type: 'input',
            name: 'fieldType',
            validate: function (input) {
                if (input == '') {
                    return 'Your class name cannot be empty.';
                }
                if (enums.indexOf(input) != -1) {
                    existingEnum = true;
                } else {
                    enums.push(input);
                }
                return true;
            },
            message: 'What is the class name of your enumeration?'
        },
        {
            when: function (response) {
                return response.fieldIsEnum;
            },
            type: 'input',
            name: 'fieldValues',
            validate: function (input) {
                if (input == '' && existingEnum) {
                    existingEnum = false;
                    return true;
                }
                if (input == '') {
                    return 'You must specify values for your enumeration';
                }
                if (!/^[A-Za-z0-9_,\s]*$/.test(input)) {
                    return 'Enum values cannot contain special characters (allowed characters: A-Z, a-z, 0-9 and _)';
                }
                var enums = input.replace(/\s/g, '').split(',');
                if (_.uniq(enums).length !== enums.length) {
                    return 'Enum values cannot contain duplicates (typed values: ' + input + ')';
                }
                for (var i = 0; i < enums.length; i++) {
                    if (/^[0-9].*/.test(enums[i])) {
                        return 'Enum value "' + enums[i] + '" cannot start with a number';
                    }
                    if (enums[i] == '') {
                        return 'Enum value cannot be empty (did you accidently type "," twice in a row?)';
                    }
                }

                return true;
            },
            message: function(answers) {
                if (!existingEnum) {
                    return 'What are the values of your enumeration (separated by comma)?';
                }
                return 'What are the new values of your enumeration (separated by comma)?\nThe new values will replace the old ones.\nNothing will be done if there are no new values.';
            }
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
                    value: 'Float',
                    name: 'Float'
                },
                {
                    value: 'Double',
                    name: 'Double'
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
                return response.fieldAdd == true &&
                    response.fieldType == 'byte[]';
            },
            type: 'list',
            name: 'fieldTypeBlobContent',
            message: 'What is the content of the Blob field?',
            choices: [
                {
                    value: 'image',
                    name: 'An image'
                },
                {
                    value: 'any',
                    name: 'A binary file'
                }
            ],
            default: 0
        },
        {
            when: function (response) {
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
                    response.fieldType == 'Float' ||
                    response.fieldType == 'Double' ||
                    response.fieldType == 'BigDecimal');
            },
            type: 'checkbox',
            name: 'fieldValidateRules',
            message: 'Which validation rules do you want to add?',
            choices: [
                {name: 'Required', value: 'required'},
                {name: 'Minimum', value: 'min'},
                {name: 'Maximum', value: 'max'}
            ],
            default: 0
        },
        {
            when: function (response) {
                return response.fieldAdd == true &&
                    response.fieldValidate == true &&
                    response.fieldType == 'byte[]';
            },
            type: 'checkbox',
            name: 'fieldValidateRules',
            message: 'Which validation rules do you want to add?',
            choices: [
                {name: 'Required', value: 'required'},
                {name: 'Minimum byte size', value: 'minbytes'},
                {name: 'Maximum byte size', value: 'maxbytes'}
            ],
            default: 0
        },
        {
            when: function (response) {
                return response.fieldAdd == true &&
                    response.fieldValidate == true &&
                    (response.fieldType == 'LocalDate' ||
                    response.fieldType == 'ZonedDateTime' ||
                    response.fieldType == 'UUID' ||
                    response.fieldType == 'Date' ||
                    response.fieldType == 'Boolean' ||
                    response.fieldIsEnum == true);
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
                    response.fieldType == 'Float' ||
                    response.fieldType == 'Double' ||
                    response.fieldType == 'BigDecimal');
            },
            type: 'input',
            name: 'fieldValidateRulesMin',
            message: 'What is the minimum of your field?',
            validate: function (input) {
                if (/^([0-9]*)$/.test(input)) return true;
                return 'Minimum must be a number';
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
                    response.fieldType == 'Float' ||
                    response.fieldType == 'Double' ||
                    response.fieldType == 'BigDecimal');
            },
            type: 'input',
            name: 'fieldValidateRulesMax',
            message: 'What is the maximum of your field?',
            validate: function (input) {
                if (/^([0-9]*)$/.test(input)) return true;
                return 'Maximum must be a number';
            },
            default: 100
        },
        {
            when: function (response) {
                return response.fieldAdd == true &&
                    response.fieldValidate == true &&
                    response.fieldValidateRules.indexOf('minbytes') != -1 &&
                    response.fieldType == 'byte[]';
            },
            type: 'input',
            name: 'fieldValidateRulesMinbytes',
            message: 'What is the minimum byte size of your field?',
            validate: function (input) {
                if (/^([0-9]*)$/.test(input)) return true;
                return 'Minimum byte size must be a number';
            },
            default: 0
        },
        {
            when: function (response) {
                return response.fieldAdd == true &&
                    response.fieldValidate == true &&
                    response.fieldValidateRules.indexOf('maxbytes') != -1 &&
                    response.fieldType == 'byte[]';
            },
            type: 'input',
            name: 'fieldValidateRulesMaxbytes',
            message: 'What is the maximum byte size of your field?',
            validate: function (input) {
                if (/^([0-9]*)$/.test(input)) return true;
                return 'Maximum byte size must be a number';
            },
            default: 5000000
        }
    ];
    this.prompt(prompts, function (props) {
        if (props.fieldAdd) {
            if (props.fieldIsEnum) {
                props.fieldType = _s.capitalize(props.fieldType);
            }

            var field = {
                fieldId: this.fieldId,
                fieldName: props.fieldName,
                fieldType: props.fieldType,
                fieldTypeBlobContent: props.fieldTypeBlobContent,
                fieldValues: props.fieldValues,
                fieldValidateRules: props.fieldValidateRules,
                fieldValidateRulesMinlength: props.fieldValidateRulesMinlength,
                fieldValidateRulesMaxlength: props.fieldValidateRulesMaxlength,
                fieldValidateRulesPattern: props.fieldValidateRulesPattern,
                fieldValidateRulesPatternJava: props.fieldValidateRulesPattern ? props.fieldValidateRulesPattern.replace(/\\/g, '\\\\') : props.fieldValidateRulesPattern,
                fieldValidateRulesMin: props.fieldValidateRulesMin,
                fieldValidateRulesMax: props.fieldValidateRulesMax,
                fieldValidateRulesMinbytes: props.fieldValidateRulesMinbytes,
                fieldValidateRulesMaxbytes: props.fieldValidateRulesMaxbytes
                };

            fieldNamesUnderscored.push(_s.underscored(props.fieldName));
            this.fields.push(field);
        }
        console.log(chalk.red('=================' + _s.capitalize(this.name) + '================='));
        for (var id in this.fields) {
            var validationDetails = '';
            var fieldValidate = _.isArray(this.fields[id].fieldValidateRules) && this.fields[id].fieldValidateRules.length >= 1;
            if (fieldValidate == true) {
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
                if (this.fields[id].fieldValidateRules.indexOf('minbytes') != -1) {
                    validationDetails += 'minbytes=\'' + this.fields[id].fieldValidateRulesMinbytes + '\' ';
                }
                if (this.fields[id].fieldValidateRules.indexOf('maxbytes') != -1) {
                    validationDetails += 'maxbytes=\'' + this.fields[id].fieldValidateRulesMaxbytes + '\' ';
                }
            }
            console.log(chalk.red(this.fields[id].fieldName) + chalk.white(' (' + this.fields[id].fieldType + (this.fields[id].fieldTypeBlobContent ? ' ' + this.fields[id].fieldTypeBlobContent : '') + ') ') + chalk.cyan(validationDetails));
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
                }
                return true;
            },
            message: 'What is the name of the relationship?',
            default: function (response) {
                 return _s.decapitalize(response.otherEntityName);
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
                    (response.relationshipType == 'one-to-one' && response.otherEntityName.toLowerCase() != "user")));
            },
            type: 'input',
            name: 'otherEntityRelationshipName',
            message: 'What is the name of this relationship in the other entity?',
            default: function (response) {
                 return _s.decapitalize(name);
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
                return (!(response.noOtherEntity == false || response.noOtherEntity2 == false) && response.relationshipAdd == true && (response.relationshipType == 'many-to-one' || (response.relationshipType == 'many-to-many' && response.ownerSide == true) || (response.relationshipType == 'one-to-one' && response.ownerSide == true)));
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
            var relationship = {
                relationshipId: this.relationshipId,
                relationshipName: props.relationshipName,
                otherEntityName: _s.decapitalize(props.otherEntityName),
                relationshipType: props.relationshipType,
                otherEntityField: props.otherEntityField,
                ownerSide: props.ownerSide,
                otherEntityRelationshipName: props.otherEntityRelationshipName
            }
            fieldNamesUnderscored.push(_s.underscored(props.relationshipName));
            this.relationships.push(relationship);
        }
        console.log(chalk.red('===========' + _s.capitalize(this.name) + '=============='));
        for (var id in this.fields) {
            console.log(chalk.red(this.fields[id].fieldName + ' (' + this.fields[id].fieldType + (this.fields[id].fieldTypeBlobContent ? ' ' + this.fields[id].fieldTypeBlobContent : '') + ')'));
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

EntityGenerator.prototype.askForDTO = function askForDTO() {
    if (this.useConfigurationFile == true) { // don't prompt if data are imported from a file
        return;
    }
    var cb = this.async();
    var prompts = [
        {
            type: 'list',
            name: 'dto',
            message: 'Do you want to use a Data Transfer Object (DTO)?',
            choices: [
                {
                    value: 'no',
                    name: 'No, use the entity directly'
                },
                {
                    value: 'mapstruct',
                    name: '[BETA] Yes, generate a DTO with MapStruct'
                }
            ],
            default: 0
        }
    ];
    this.prompt(prompts, function (props) {
        this.dto = props.dto;
        cb();
    }.bind(this));
};

EntityGenerator.prototype.askForService = function askForService() {
    if (this.useConfigurationFile == true) { // don't prompt if data are imported from a file
        return;
    }
    var cb = this.async();
    var prompts = [
        {
            type: 'list',
            name: 'service',
            message: 'Do you want to use separate service class for your business logic?',
            choices: [
                {
                    value: 'no',
                    name: 'No, the REST controller should use the repository directly'
                },
                {
                    value: 'serviceClass',
                    name: '[BETA] Yes, generate a separate service class'
                },
                {
                    value: 'serviceImpl',
                    name: '[BETA] Yes, generate a separate service interface and implementation'
                }
            ],
            default: 0
        }
    ];
    this.prompt(prompts, function (props) {
        this.service = props.service;
        cb();
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
    // Expose utility methods in templates
    this.util = {};
    this.util.contains = _.contains;
    var wordwrap = function(text, width, seperator, keepLF){
        var wrappedText = '';
        var rows = text.split('\n');
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            if(keepLF == true && i != 0) {
                wrappedText = wrappedText + '\\n';
            }
            wrappedText = wrappedText + seperator + _s.wrap(row, { width: width , seperator : seperator, preserveSpaces: keepLF });
        }
        return wrappedText;
    }
    var wordwrapWidth = 80;
    this.util.formatAsClassJavadoc = function (text) {
        return '/**' + wordwrap(text, wordwrapWidth - 4, '\n * ', false) + '\n */';
    };
    this.util.formatAsFieldJavadoc = function (text) {
        return '    /**' + wordwrap(text, wordwrapWidth - 8, '\n     * ', false) + '\n     */';
    };
    this.util.formatAsApiModel = function (text) {
        return wordwrap(text.replace(/\\/g, '\\\\').replace(/\"/g, '\\\"'), wordwrapWidth - 9, '"\n    + "', true)
    };
    this.util.formatAsApiModelProperty = function (text) {
        return wordwrap(text.replace(/\\/g, '\\\\').replace(/\"/g, '\\\"'), wordwrapWidth - 13, '"\n        + "', true)
    };

    if (this.useConfigurationFile == false) { // store informations in a file for further use.
        if (this.databaseType == "sql" || this.databaseType == "cassandra") {
            this.changelogDate = this.dateFormatForLiquibase();
        }
        this.data = {};
        this.data.relationships = this.relationships;
        this.data.fields = this.fields;
        this.data.changelogDate = this.changelogDate;
        this.data.dto = this.dto;
        this.data.service = this.service;
        if (databaseType == 'sql' || databaseType == 'mongodb') {
            this.data.pagination = this.pagination;
        }
        this.write(this.filename, JSON.stringify(this.data, null, 4));
    } else {
        this.relationships = this.fileData.relationships;
        this.fields = this.fileData.fields;
        this.changelogDate = this.fileData.changelogDate;
        this.dto = this.fileData.dto;
        this.service = this.fileData.service;
        this.pagination = this.fileData.pagination;
        this.javadoc = this.fileData.javadoc;

        // Validate entity json field content
        for (var idx in this.fields) {
            var field = this.fields[idx];
            if (_.isUndefined(field.fieldId)) {
                console.log(chalk.red('ERROR fieldId is missing in .jhipster/' + this.name + '.json for field ' + JSON.stringify(field, null, 4)));
                process.exit(1);
            }

            if (_.isUndefined(field.fieldName)) {
                console.log(chalk.red('ERROR fieldName is missing in .jhipster/' + this.name + '.json for field with id ' + field.fieldId));
                process.exit(1);
            }

            if (_.isUndefined(field.fieldType)) {
                console.log(chalk.red('ERROR fieldType is missing in .jhipster/' + this.name + '.json for field with id ' + field.fieldId));
                process.exit(1);
            }

            if (!_.isUndefined(field.fieldValidateRules)) {
                if (!_.isArray(field.fieldValidateRules)) {
                    console.log(chalk.red('ERROR fieldValidateRules is not an array in .jhipster/' + this.name + '.json for field with id ' + field.fieldId));
                    process.exit(1);
                }
                for (var idxRules in field.fieldValidateRules) {
                    var fieldValidateRule = field.fieldValidateRules[idxRules];
                    if (!_.contains(supportedValidationRules, fieldValidateRule)) {
                        console.log(chalk.red('ERROR fieldValidateRules contains unknown validation rule ' + fieldValidateRule + ' in .jhipster/' + this.name + '.json for field with id ' + field.fieldId + ' [supported validation rules ' + supportedValidationRules + ']'));
                        process.exit(1);
                    }
                }
                if (_.contains(field.fieldValidateRules, 'max') && _.isUndefined(field.fieldValidateRulesMax)) {
                    console.log(chalk.red('ERROR fieldValidateRulesMax is missing in .jhipster/' + this.name + '.json for field with id ' + field.fieldId));
                    process.exit(1);
                }
                if (_.contains(field.fieldValidateRules, 'min') && _.isUndefined(field.fieldValidateRulesMin)) {
                    console.log(chalk.red('ERROR fieldValidateRulesMin is missing in .jhipster/' + this.name + '.json for field with id ' + field.fieldId));
                    process.exit(1);
                }
                if (_.contains(field.fieldValidateRules, 'maxlength') && _.isUndefined(field.fieldValidateRulesMaxlength)) {
                    console.log(chalk.red('ERROR fieldValidateRulesMaxlength is missing in .jhipster/' + this.name + '.json for field with id ' + field.fieldId));
                    process.exit(1);
                }
                if (_.contains(field.fieldValidateRules, 'minlength') && _.isUndefined(field.fieldValidateRulesMinlength)) {
                    console.log(chalk.red('ERROR fieldValidateRulesMinlength is missing in .jhipster/' + this.name + '.json for field with id ' + field.fieldId));
                    process.exit(1);
                }
                if (_.contains(field.fieldValidateRules, 'maxbytes') && _.isUndefined(field.fieldValidateRulesMaxbytes)) {
                    console.log(chalk.red('ERROR fieldValidateRulesMaxbytes is missing in .jhipster/' + this.name + '.json for field with id ' + field.fieldId));
                    process.exit(1);
                }
                if (_.contains(field.fieldValidateRules, 'minbytes') && _.isUndefined(field.fieldValidateRulesMinbytes)) {
                    console.log(chalk.red('ERROR fieldValidateRulesMinbytes is missing in .jhipster/' + this.name + '.json for field with id ' + field.fieldId));
                    process.exit(1);
                }
                if (_.contains(field.fieldValidateRules, 'pattern') && _.isUndefined(field.fieldValidateRulesPattern)) {
                    console.log(chalk.red('ERROR fieldValidateRulesPattern is missing in .jhipster/' + this.name + '.json for field with id ' + field.fieldId));
                    process.exit(1);
                }
            }
        }

        // Validate entity json relationship content
        for (var idx in this.relationships) {
            var relationship = this.relationships[idx];
            if (_.isUndefined(relationship.relationshipId)) {
                console.log(chalk.red('ERROR relationshipId is missing in .jhipster/' + this.name + '.json for relationship ' + JSON.stringify(relationship, null, 4)));
                process.exit(1);
            }

            if (_.isUndefined(relationship.relationshipName)) {
                relationship.relationshipName = relationship.otherEntityName;
                console.log(chalk.yellow('WARNING relationshipName is missing in .jhipster/' + this.name + '.json for relationship with id ' + relationship.relationshipId + ', using ' + relationship.otherEntityName + ' as fallback'));
            }

            if (_.isUndefined(relationship.otherEntityName)) {
                console.log(chalk.red('ERROR otherEntityName is missing in .jhipster/' + this.name + '.json for relationship with id ' + relationship.relationshipId));
                process.exit(1);
            }

            if (_.isUndefined(relationship.otherEntityRelationshipName)
                && (relationship.relationshipType == 'one-to-many' || (relationship.relationshipType == 'many-to-many' && relationship.ownerSide == false) || (relationship.relationshipType == 'one-to-one'))) {
                relationship.otherEntityRelationshipName = _s.decapitalize(this.name);
                console.log(chalk.yellow('WARNING otherEntityRelationshipName is missing in .jhipster/' + this.name + '.json for relationship with id ' + relationship.relationshipId + ', using ' + _s.decapitalize(this.name) + ' as fallback'));
            }

            if (_.isUndefined(relationship.otherEntityField)
                && (relationship.relationshipType == 'many-to-one' || (relationship.relationshipType == 'many-to-many' && relationship.ownerSide == true) || (relationship.relationshipType == 'one-to-one' && relationship.ownerSide == true))) {
                console.log(chalk.yellow('WARNING otherEntityField is missing in .jhipster/' + this.name + '.json for relationship with id ' + relationship.relationshipId + ', using id as fallback'));
                relationship.otherEntityField = 'id';
            }

            if (_.isUndefined(relationship.relationshipType)) {
                console.log(chalk.red('ERROR relationshipType is missing in .jhipster/' + this.name + '.json for relationship with id ' + relationship.relationshipId));
                process.exit(1);
            }

            if (_.isUndefined(relationship.ownerSide)
                && (relationship.relationshipType == 'one-to-one' || relationship.relationshipType == 'many-to-many')) {
                console.log(chalk.red('ERROR ownerSide is missing in .jhipster/' + this.name + '.json for relationship with id ' + relationship.relationshipId));
                process.exit(1);
            }
        }

        // Validate root entity json content
        if (_.isUndefined(this.changelogDate)
            && (this.databaseType == "sql" || this.databaseType == "cassandra")) {
            var currentDate = this.dateFormatForLiquibase();
            console.log(chalk.yellow('WARNING changelogDate is missing in .jhipster/' + this.name + '.json, using ' + currentDate + ' as fallback'));
            this.changelogDate = currentDate;
        }
        if (_.isUndefined(this.dto)) {
            console.log(chalk.yellow('WARNING dto is missing in .jhipster/' + this.name + '.json, using no as fallback'));
            this.dto = 'no';
        }
        if (_.isUndefined(this.service)) {
            console.log(chalk.yellow('WARNING service is missing in .jhipster/' + this.name + '.json, using no as fallback'));
            this.service = 'no';
        }
        if (_.isUndefined(this.pagination)) {
            if (databaseType == 'sql' || databaseType == 'mongodb') {
                console.log(chalk.yellow('WARNING pagination is missing in .jhipster/' + this.name + '.json, using no as fallback'));
                this.pagination = 'no';
            } else {
                this.pagination = 'no';
            }
        }
    }

    // Load in-memory data for fields
    for (var idx in this.fields) {
        var field = this.fields[idx];

        // Migration from JodaTime to Java Time
        if (field.fieldType == 'DateTime') {
            field.fieldType = 'ZonedDateTime';
        }

        if ((databaseType == 'sql' || databaseType == 'mongodb') && !_.contains([
            'String', 'Integer', 'Long', 'Float', 'Double', 'BigDecimal',
            'LocalDate', 'ZonedDateTime', 'Boolean', 'byte[]'], field.fieldType)) {
            field.fieldIsEnum = true;
        } else {
            field.fieldIsEnum = false;
        }

        if (_.isUndefined(field.fieldNameCapitalized)) {
            field.fieldNameCapitalized = _s.capitalize(field.fieldName);
        }

        if (_.isUndefined(field.fieldNameUnderscored)) {
            field.fieldNameUnderscored = _s.underscored(field.fieldName);
        }

        if (_.isUndefined(field.fieldInJavaBeanMethod)) {
            // Handle the specific case when the second letter is capitalized
            // See http://stackoverflow.com/questions/2948083/naming-convention-for-getters-setters-in-java
            if (field.fieldName.length > 1) {
                var firstLetter = field.fieldName.charAt(0);
                var secondLetter = field.fieldName.charAt(1);
                if (firstLetter == firstLetter.toLowerCase() && secondLetter == secondLetter.toUpperCase()) {
                    field.fieldInJavaBeanMethod = firstLetter.toLowerCase() + field.fieldName.slice(1);
                } else {
                    field.fieldInJavaBeanMethod = _s.capitalize(field.fieldName);
                }
            } else {
                field.fieldInJavaBeanMethod = _s.capitalize(field.fieldName);
            }
        }

        if (_.isArray(field.fieldValidateRules) && field.fieldValidateRules.length >= 1) {
            field.fieldValidate = true;
        } else {
            field.fieldValidate = false;
        }
    }

    // Load in-memory data for relationships
    for (var idx in this.relationships) {
        var relationship = this.relationships[idx];

        if (_.isUndefined(relationship.relationshipNameCapitalized)) {
            relationship.relationshipNameCapitalized = _s.capitalize(relationship.relationshipName);
        }

        if (_.isUndefined(relationship.relationshipFieldName)) {
            relationship.relationshipFieldName = _s.decapitalize(relationship.relationshipName);
        }

        if (_.isUndefined(relationship.otherEntityNameCapitalized)) {
            relationship.otherEntityNameCapitalized = _s.capitalize(relationship.otherEntityName);
        }

        if (_.isUndefined(relationship.otherEntityFieldCapitalized)) {
            relationship.otherEntityFieldCapitalized = _s.capitalize(relationship.otherEntityField);
        }
    }

    // Load in-memory data for root
    this.fieldsContainOwnerManyToMany = false;
    for (var idx in this.relationships) {
        var relationship = this.relationships[idx];
        if (relationship.relationshipType == 'many-to-many' && relationship.ownerSide == true) {
            this.fieldsContainOwnerManyToMany = true;
        }
    }
    this.fieldsContainNoOwnerOneToOne = false;
    for (var idx in this.relationships) {
        var relationship = this.relationships[idx];
        if (relationship.relationshipType == 'one-to-one' && relationship.ownerSide == false) {
            this.fieldsContainNoOwnerOneToOne = true;
        }
    }
    this.fieldsContainOwnerOneToOne = false;
    for (var idx in this.relationships) {
        var relationship = this.relationships[idx];
        if (relationship.relationshipType == 'one-to-one' && relationship.ownerSide == true) {
            this.fieldsContainOwnerOneToOne = true;
        }
    }
    this.fieldsContainOneToMany = false;
    for (var idx in this.relationships) {
        var relationship = this.relationships[idx];
        if (relationship.relationshipType == 'one-to-many') {
            this.fieldsContainOneToMany = true;
        }
    }
    this.fieldsContainZonedDateTime = false;
    for (var idx in this.fields) {
        var field = this.fields[idx];
        if (field.fieldType == 'ZonedDateTime') {
            this.fieldsContainZonedDateTime = true;
        }
    }
    this.fieldsContainLocalDate = false;
    for (var idx in this.fields) {
        var field = this.fields[idx];
        if (field.fieldType == 'LocalDate') {
            this.fieldsContainLocalDate = true;
        }
    }
    this.fieldsContainDate = false;
    for (var idx in this.fields) {
        var field = this.fields[idx];
        if (field.fieldType == 'Date') {
            this.fieldsContainDate = true;
        }
    }
    this.fieldsContainBigDecimal = false;
    for (var idx in this.fields) {
        var field = this.fields[idx];
        if (field.fieldType == 'BigDecimal') {
            this.fieldsContainBigDecimal = true;
        }
    }
    this.fieldsContainBlob = false;
    for (var idx in this.fields) {
        var field = this.fields[idx];
        if (field.fieldType == 'byte[]') {
            this.fieldsContainBlob = true;
        }
    }
    this.validation = false;
    for (var idx in this.fields) {
        var field = this.fields[idx];
        if (field.fieldValidate == true) {
            this.validation = true;
        }
    }
    if (this.databaseType === 'cassandra' || this.databaseType === 'mongodb') {
        this.pkType = 'String';
    } else {
        this.pkType = 'Long';
    }
    this.entityClass = _s.capitalize(this.name);
    this.entityInstance = _s.decapitalize(this.name);
    this.entityTableName = _s.underscored(this.name).toLowerCase();

    this.differentTypes = [this.entityClass];
    if (this.relationships == undefined) {
        this.relationships = [];
    }
    var relationshipId;
    for (relationshipId in this.relationships) {
        var entityType = this.relationships[relationshipId].otherEntityNameCapitalized;
        if (this.differentTypes.indexOf(entityType) == -1) {
            this.differentTypes.push(entityType);
        }
    }

    var insight = this.insight();
    var interpolateRegex = /<%=([\s\S]+?)%>/g; // so that thymeleaf tags in templates do not get mistreated as _ templates
    insight.track('generator', 'entity');
    insight.track('entity/fields', this.fields.length);
    insight.track('entity/relationships', this.relationships.length);
    insight.track('entity/pagination', this.pagination);
    insight.track('entity/dto', this.dto);
    insight.track('entity/service', this.service);

    var resourceDir = 'src/main/resources/';

    for (var fieldIdx in this.fields) {
        var field = this.fields[fieldIdx];
        if (field.fieldIsEnum == true) {
            var fieldType = field.fieldType;
            var enumInfo = new Object();
            enumInfo.packageName = this.packageName;
            enumInfo.enumName = fieldType;
            enumInfo.enumValues = field.fieldValues;
            field.enumInstance = _s.decapitalize(enumInfo.enumName);
            enumInfo.enumInstance = field.enumInstance;
            enumInfo.angularAppName = this.angularAppName;
            enumInfo.enums = enumInfo.enumValues.replace(/\s/g, '').split(',');
            this.template('src/main/java/package/domain/enumeration/_Enum.java',
                'src/main/java/' + this.packageFolder + '/domain/enumeration/' + fieldType + '.java', enumInfo, {});

            // Copy for each
            if (this.enableTranslation) {
                this.copyEnumI18n('ca', enumInfo);
                this.copyEnumI18n('zh-cn', enumInfo);
                this.copyEnumI18n('zh-tw', enumInfo);
                this.copyEnumI18n('da', enumInfo);
                this.copyEnumI18n('de', enumInfo);
                this.copyEnumI18n('en', enumInfo);
                this.copyEnumI18n('fr', enumInfo);
                this.copyEnumI18n('gl', enumInfo);
                this.copyEnumI18n('hu', enumInfo);
                this.copyEnumI18n('it', enumInfo);
                this.copyEnumI18n('ja', enumInfo);
                this.copyEnumI18n('ko', enumInfo);
                this.copyEnumI18n('pl', enumInfo);
                this.copyEnumI18n('pt-br', enumInfo);
                this.copyEnumI18n('pt-pt', enumInfo);
                this.copyEnumI18n('ro', enumInfo);
                this.copyEnumI18n('ru', enumInfo);
                this.copyEnumI18n('es', enumInfo);
                this.copyEnumI18n('sv', enumInfo);
                this.copyEnumI18n('tr', enumInfo);
                this.copyEnumI18n('ta', enumInfo);
            }
        }
    }

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
    if (this.service == 'serviceImpl') {
        this.template('src/main/java/package/service/_EntityService.java',
            'src/main/java/' + this.packageFolder + '/service/' +    this.entityClass + 'Service.java', this, {});
        this.template('src/main/java/package/service/impl/_EntityServiceImpl.java',
            'src/main/java/' + this.packageFolder + '/service/impl/' +    this.entityClass + 'ServiceImpl.java', this, {});
    } else if(this.service == 'serviceClass') {
        this.template('src/main/java/package/service/impl/_EntityServiceImpl.java',
            'src/main/java/' + this.packageFolder + '/service/' +    this.entityClass + 'Service.java', this, {});
    }
    if (this.dto == 'mapstruct') {
        this.template('src/main/java/package/web/rest/dto/_EntityDTO.java',
            'src/main/java/' + this.packageFolder + '/web/rest/dto/' +    this.entityClass + 'DTO.java', this, {});

        this.template('src/main/java/package/web/rest/mapper/_EntityMapper.java',
            'src/main/java/' + this.packageFolder + '/web/rest/mapper/' +    this.entityClass + 'Mapper.java', this, {});
    }

    if (this.databaseType == "sql") {
        this.template(resourceDir + '/config/liquibase/changelog/_added_entity.xml',
            resourceDir + 'config/liquibase/changelog/' + this.changelogDate + '_added_entity_' + this.entityClass + '.xml', this, { 'interpolate': interpolateRegex });

        this.addChangelogToLiquibase(this.changelogDate + '_added_entity_' + this.entityClass);
    }
    if (this.databaseType == "cassandra") {
        this.template(resourceDir + '/config/cql/_added_entity.cql',
            resourceDir + 'config/cql/' + this.changelogDate + '_added_entity_' + this.entityClass + '.cql', this, {});
    }

    this.copyHtml('src/main/webapp/app/_entities.html',
        'src/main/webapp/scripts/app/entities/' +    this.entityInstance  + '/' + this.entityInstance + 's.html', this, {}, true);
    this.copyHtml('src/main/webapp/app/_entity-detail.html',
        'src/main/webapp/scripts/app/entities/' +    this.entityInstance  + '/' + this.entityInstance + '-detail.html', this, {}, true);
    this.copyHtml('src/main/webapp/app/_entity-dialog.html',
        'src/main/webapp/scripts/app/entities/' +    this.entityInstance  + '/' + this.entityInstance + '-dialog.html', this, {}, true);
    this.copyHtml('src/main/webapp/app/_entity-delete-dialog.html',
        'src/main/webapp/scripts/app/entities/' +    this.entityInstance  + '/' + this.entityInstance + '-delete-dialog.html', this, {}, true);

    this.addEntityToMenu(this.entityInstance, this.enableTranslation);

    this.template('src/main/webapp/app/_entity.js',
        'src/main/webapp/scripts/app/entities/' +    this.entityInstance + '/' + this.entityInstance + '.js', this, {});
    this.addJavaScriptToIndex('app/entities/' + this.entityInstance + '/' + this.entityInstance + '.js');
    this.template('src/main/webapp/app/_entity-controller.js',
        'src/main/webapp/scripts/app/entities/' +    this.entityInstance + '/' + this.entityInstance + '.controller' + '.js', this, {});
    this.addJavaScriptToIndex('app/entities/' + this.entityInstance + '/' + this.entityInstance + '.controller' + '.js');
    this.template('src/main/webapp/app/_entity-dialog-controller.js',
        'src/main/webapp/scripts/app/entities/' +    this.entityInstance + '/' + this.entityInstance + '-dialog.controller' + '.js', this, {});
    this.addJavaScriptToIndex('app/entities/' + this.entityInstance + '/' + this.entityInstance + '-dialog.controller' + '.js');
    this.template('src/main/webapp/app/_entity-delete-dialog-controller.js',
        'src/main/webapp/scripts/app/entities/' +    this.entityInstance + '/' + this.entityInstance + '-delete-dialog.controller' + '.js', this, {});
    this.addJavaScriptToIndex('app/entities/' + this.entityInstance + '/' + this.entityInstance + '-delete-dialog.controller' + '.js');

    this.template('src/main/webapp/app/_entity-detail-controller.js',
        'src/main/webapp/scripts/app/entities/' +    this.entityInstance + '/' + this.entityInstance + '-detail.controller' + '.js', this, {});
    this.template('src/test/javascript/spec/app/_entity-detail-controller.spec.js',
        'src/test/javascript/spec/app/entities/' +    this.entityInstance + '/' + this.entityInstance + '-detail.controller.spec.js', this, {});
    this.addJavaScriptToIndex('app/entities/' + this.entityInstance + '/' + this.entityInstance + '-detail.controller' + '.js');

    this.template('src/main/webapp/components/_entity-service.js',
        'src/main/webapp/scripts/components/entities/' + this.entityInstance + '/' + this.entityInstance + '.service' + '.js', this, {});
    this.addJavaScriptToIndex('components/entities/' + this.entityInstance + '/' + this.entityInstance + '.service' + '.js');

    if (this.searchEngine == 'elasticsearch') {
        this.template('src/main/webapp/components/_entity-search-service.js',
            'src/main/webapp/scripts/components/entities/' + this.entityInstance + '/' + this.entityInstance + '.search.service' + '.js', this, {});
        this.addJavaScriptToIndex('components/entities/' + this.entityInstance + '/' + this.entityInstance + '.search.service' + '.js');
    }

    this.template('src/test/java/package/web/rest/_EntityResourceIntTest.java',
        'src/test/java/' + this.packageFolder + '/web/rest/' +    this.entityClass + 'ResourceIntTest.java', this, {});

    if (this.testFrameworks.indexOf('gatling') != -1) {
        this.template('src/test/gatling/simulations/_EntityGatlingTest.scala',
            'src/test/gatling/simulations/' + this.entityClass + 'GatlingTest.scala', this, { 'interpolate': /<%=([\s\S]+?)%>/g });
    }

    // Copy for each
    if(this.enableTranslation) {
        this.copyI18n('ca');
        this.copyI18n('zh-cn');
        this.copyI18n('zh-tw');
        this.copyI18n('da');
        this.copyI18n('nl');
        this.copyI18n('de');
        this.copyI18n('en');
        this.copyI18n('fr');
        this.copyI18n('gl');
        this.copyI18n('hu');
        this.copyI18n('it');
        this.copyI18n('ja');
        this.copyI18n('ko');
        this.copyI18n('pl');
        this.copyI18n('pt-br');
        this.copyI18n('pt-pt');
        this.copyI18n('ro');
        this.copyI18n('ru');
        this.copyI18n('es');
        this.copyI18n('sv');
        this.copyI18n('tr');
        this.copyI18n('ta');
    }
};

EntityGenerator.prototype.copyI18n = function(language) {
    try {
        var stats = fs.lstatSync('src/main/webapp/i18n/' + language);
        if (stats.isDirectory()) {
            this.template('src/main/webapp/i18n/_entity_' + language + '.json', 'src/main/webapp/i18n/' + language + '/' + this.entityInstance + '.json', this, {});
            this.addEntityTranslationKey(this.entityInstance, this.entityClass, language);
        }
    } catch(e) {
        // An exception is thrown if the folder doesn't exist
        // do nothing
    }
};

EntityGenerator.prototype.copyEnumI18n = function(language, enumInfo) {
    try {
        var stats = fs.lstatSync('src/main/webapp/i18n/' + language);
        if (stats.isDirectory()) {
            this.template('src/main/webapp/i18n/_enum_' + language + '.json', 'src/main/webapp/i18n/' + language + '/' + enumInfo.enumInstance + '.json', enumInfo, {});
        }
    } catch(e) {
        // An exception is thrown if the folder doesn't exist
        // do nothing
    }
};

EntityGenerator.prototype.getTableName = function(value) {
    return _s.underscored(value).toLowerCase();
};

EntityGenerator.prototype.getColumnName = function(value) {
    return _s.underscored(value).toLowerCase();
};
