'use strict';
var util = require('util'),
fs = require('fs'),
path = require('path'),
generators = require('yeoman-generator'),
chalk = require('chalk'),
_ = require('lodash'),
_s = require('underscore.string'),
shelljs = require('shelljs'),
pluralize = require('pluralize'),
scriptBase = require('../script-base');

/* constants used througout */
const RESERVED_WORDS_JAVA = ["ABSTRACT", "CONTINUE", "FOR", "NEW", "SWITCH", "ASSERT", "DEFAULT", "GOTO", "PACKAGE", "SYNCHRONIZED", "BOOLEAN", "DO", "IF", "PRIVATE", "THIS", "BREAK", "DOUBLE", "IMPLEMENTS", "PROTECTED", "THROW", "BYTE", "ELSE", "IMPORT", "PUBLIC", "THROWS", "CASE", "ENUM", "INSTANCEOF", "RETURN", "TRANSIENT", "CATCH", "EXTENDS", "INT", "SHORT", "TRY", "CHAR", "FINAL", "INTERFACE", "STATIC", "VOID", "CLASS", "FINALLY", "LONG", "STRICTFP", "VOLATILE", "CONST", "FLOAT", "NATIVE", "SUPER", "WHILE"];

const RESERVED_WORDS_MYSQL = ["ACCESSIBLE", "ADD", "ALL", "ALTER", "ANALYZE", "AND", "AS", "ASC", "ASENSITIVE", "BEFORE", "BETWEEN", "BIGINT", "BINARY", "BLOB", "BOTH", "BY", "CALL", "CASCADE", "CASE", "CHANGE", "CHAR", "CHARACTER", "CHECK", "COLLATE", "COLUMN", "CONDITION", "CONSTRAINT", "CONTINUE", "CONVERT", "CREATE", "CROSS", "CURRENT_DATE", "CURRENT_TIME", "CURRENT_TIMESTAMP", "CURRENT_USER", "CURSOR", "DATABASE", "DATABASES", "DAY_HOUR", "DAY_MICROSECOND", "DAY_MINUTE", "DAY_SECOND", "DEC", "DECIMAL", "DECLARE", "DEFAULT", "DELAYED", "DELETE", "DESC", "DESCRIBE", "DETERMINISTIC", "DISTINCT", "DISTINCTROW", "DIV", "DOUBLE", "DROP", "DUAL", "EACH", "ELSE", "ELSEIF", "ENCLOSED", "ESCAPED", "EXISTS", "EXIT", "EXPLAIN", "FALSE", "FETCH", "FLOAT", "FLOAT4", "FLOAT8", "FOR", "FORCE", "FOREIGN", "FROM", "FULLTEXT", "GRANT", "GROUP", "HAVING", "HIGH_PRIORITY", "HOUR_MICROSECOND", "HOUR_MINUTE", "HOUR_SECOND", "IF", "IGNORE", "IN", "INDEX", "INFILE", "INNER", "INOUT", "INSENSITIVE", "INSERT", "INT", "INT1", "INT2", "INT3", "INT4", "INT8", "INTEGER", "INTERVAL", "INTO", "IS", "ITERATE", "JOIN", "KEY", "KEYS", "KILL", "LEADING", "LEAVE", "LEFT", "LIKE", "LIMIT", "LINEAR", "LINES", "LOAD", "LOCALTIME", "LOCALTIMESTAMP", "LOCK", "LONG", "LONGBLOB", "LONGTEXT", "LOOP", "LOW_PRIORITY", "MASTER_SSL_VERIFY_SERVER_CERT", "MATCH", "MAXVALUE", "MEDIUMBLOB", "MEDIUMINT", "MEDIUMTEXT", "MIDDLEINT", "MINUTE_MICROSECOND", "MINUTE_SECOND", "MOD", "MODIFIES", "NATURAL", "NOT", "NO_WRITE_TO_BINLOG", "NULL", "NUMERIC", "ON", "OPTIMIZE", "OPTION", "OPTIONALLY", "OR", "ORDER", "OUT", "OUTER", "OUTFILE", "PRECISION", "PRIMARY", "PROCEDURE", "PURGE", "RANGE", "READ", "READS", "READ_WRITE", "REAL", "REFERENCES", "REGEXP", "RELEASE", "RENAME", "REPEAT", "REPLACE", "REQUIRE", "RESIGNAL", "RESTRICT", "RETURN", "REVOKE", "RIGHT", "RLIKE", "SCHEMA", "SCHEMAS", "SECOND_MICROSECOND", "SELECT", "SENSITIVE", "SEPARATOR", "SET", "SHOW", "SIGNAL", "SMALLINT", "SPATIAL", "SPECIFIC", "SQL", "SQLEXCEPTION", "SQLSTATE", "SQLWARNING", "SQL_BIG_RESULT", "SQL_CALC_FOUND_ROWS", "SQL_SMALL_RESULT", "SSL", "STARTING", "STRAIGHT_JOIN", "TABLE", "TERMINATED", "THEN", "TINYBLOB", "TINYINT", "TINYTEXT", "TO", "TRAILING", "TRIGGER", "TRUE", "UNDO", "UNION", "UNIQUE", "UNLOCK", "UNSIGNED", "UPDATE", "USAGE", "USE", "USING", "UTC_DATE", "UTC_TIME", "UTC_TIMESTAMP", "VALUES", "VARBINARY", "VARCHAR", "VARCHARACTER", "VARYING", "WHEN", "WHERE", "WHILE", "WITH", "WRITE", "XOR", "YEAR_MONTH", "ZEROFILL", "GENERAL", "IGNORE_SERVER_IDS", "MASTER_HEARTBEAT_PERIOD", "MAXVALUE", "RESIGNAL", "SIGNAL", "SLOW"];

const RESERVED_WORDS_POSGRES = ["ALL", "ANALYSE", "ANALYZE", "AND", "ANY", "ARRAY", "AS", "ASC", "ASYMMETRIC", "AUTHORIZATION", "BINARY", "BOTH", "CASE", "CAST", "CHECK", "COLLATE", "COLLATION", "COLUMN", "CONCURRENTLY", "CONSTRAINT", "CREATE", "CROSS", "CURRENT_CATALOG", "CURRENT_DATE", "CURRENT_ROLE", "CURRENT_SCHEMA", "CURRENT_TIME", "CURRENT_TIMESTAMP", "CURRENT_USER", "DEFAULT", "DEFERRABLE", "DESC", "DISTINCT", "DO", "ELSE", "END", "EXCEPT", "FALSE", "FETCH", "FOR", "FOREIGN", "FROM", "FULL", "GRANT", "GROUP", "HAVING", "ILIKE", "IN", "INITIALLY", "INNER", "INTERSECT", "INTO", "IS", "ISNULL", "JOIN", "LATERAL", "LEADING", "LEFT", "LIKE", "LIMIT", "LOCALTIME", "LOCALTIMESTAMP", "NATURAL", "NOT", "NOTNULL", "NULL", "OFFSET", "ON", "ONLY", "OR", "ORDER", "OUTER", "OVERLAPS", "PLACING", "PRIMARY", "REFERENCES", "RETURNING", "RIGHT", "SELECT", "SESSION_USER", "SIMILAR", "SOME", "SYMMETRIC", "TABLE", "THEN", "TO", "TRAILING", "TRUE", "UNION", "UNIQUE", "USER", "USING", "VARIADIC", "VERBOSE", "WHEN", "WHERE", "WINDOW", "WITH"];

const RESERVED_WORDS_CASSANDRA = ["ADD", "ALL", "ALTER", "AND", "ANY", "APPLY", "AS", "ASC", "ASCII", "AUTHORIZE", "BATCH", "BEGIN", "BIGINT", "BLOB", "BOOLEAN", "BY", "CLUSTERING", "COLUMNFAMILY", "COMPACT", "CONSISTENCY", "COUNT", "COUNTER", "CREATE", "DECIMAL", "DELETE", "DESC", "DOUBLE", "DROP", "EACH_QUORUM", "FLOAT", "FROM", "GRANT", "IN", "INDEX", "CUSTOM", "INSERT", "INT", "INTO", "KEY", "KEYSPACE", "LEVEL", "LIMIT", "LOCAL_ONE", "LOCAL_QUORUM", "MODIFY", "NORECURSIVE", "NOSUPERUSER", "OF", "ON", "ONE", "ORDER", "PASSWORD", "PERMISSION", "PERMISSIONS", "PRIMARY", "QUORUM", "REVOKE", "SCHEMA", "SELECT", "SET", "STORAGE", "SUPERUSER", "TABLE", "TEXT", "TIMESTAMP", "TIMEUUID", "THREE", "TOKEN", "TRUNCATE", "TTL", "TWO", "TYPE", "UPDATE", "USE", "USER", "USERS", "USING", "UUID", "VALUES", "VARCHAR", "VARINT", "WHERE", "WITH", "WRITETIME", "DISTINCT", "BYTE", "SMALLINT", "COMPLEX", "ENUM", "DATE", "INTERVAL", "MACADDR", "BITSTRING"];

const RESERVED_WORDS_ORACLE = ["ACCESS", "ACCOUNT", "ACTIVATE", "ADD", "ADMIN", "ADVISE", "AFTER", "ALL", "ALL_ROWS", "ALLOCATE", "ALTER", "ANALYZE", "AND", "ANY", "ARCHIVE", "ARCHIVELOG", "ARRAY", "AS", "ASC", "AT", "AUDIT", "AUTHENTICATED", "AUTHORIZATION", "AUTOEXTEND", "AUTOMATIC", "BACKUP", "BECOME", "BEFORE", "BEGIN", "BETWEEN", "BFILE", "BITMAP", "BLOB", "BLOCK", "BODY", "BY", "CACHE", "CACHE_INSTANCES", "CANCEL", "CASCADE", "CAST", "CFILE", "CHAINED", "CHANGE", "CHAR", "CHAR_CS", "CHARACTER", "CHECK", "CHECKPOINT", "CHOOSE", "CHUNK", "CLEAR", "CLOB", "CLONE", "CLOSE", "CLOSE_CACHED_OPEN_CURSORS", "CLUSTER", "COALESCE", "COLUMN", "COLUMNS", "COMMENT", "COMMIT", "COMMITTED", "COMPATIBILITY", "COMPILE", "COMPLETE", "COMPOSITE_LIMIT", "COMPRESS", "COMPUTE", "CONNECT", "CONNECT_TIME", "CONSTRAINT", "CONSTRAINTS", "CONTENTS", "CONTINUE", "CONTROLFILE", "CONVERT", "COST", "CPU_PER_CALL", "CPU_PER_SESSION", "CREATE", "CURRENT", "CURRENT_SCHEMA", "CURREN_USER", "CURSOR", "CYCLE", " ", "DANGLING", "DATABASE", "DATAFILE", "DATAFILES", "DATAOBJNO", "DATE", "DBA", "DBHIGH", "DBLOW", "DBMAC", "DEALLOCATE", "DEBUG", "DEC", "DECIMAL", "DECLARE", "DEFAULT", "DEFERRABLE", "DEFERRED", "DEGREE", "DELETE", "DEREF", "DESC", "DIRECTORY", "DISABLE", "DISCONNECT", "DISMOUNT", "DISTINCT", "DISTRIBUTED", "DML", "DOUBLE", "DROP", "DUMP", "EACH", "ELSE", "ENABLE", "END", "ENFORCE", "ENTRY", "ESCAPE", "EXCEPT", "EXCEPTIONS", "EXCHANGE", "EXCLUDING", "EXCLUSIVE", "EXECUTE", "EXISTS", "EXPIRE", "EXPLAIN", "EXTENT", "EXTENTS", "EXTERNALLY", "FAILED_LOGIN_ATTEMPTS", "FALSE", "FAST", "FILE", "FIRST_ROWS", "FLAGGER", "FLOAT", "FLOB", "FLUSH", "FOR", "FORCE", "FOREIGN", "FREELIST", "FREELISTS", "FROM", "FULL", "FUNCTION", "GLOBAL", "GLOBALLY", "GLOBAL_NAME", "GRANT", "GROUP", "GROUPS", "HASH", "HASHKEYS", "HAVING", "HEADER", "HEAP", "IDENTIFIED", "IDGENERATORS", "IDLE_TIME", "IF", "IMMEDIATE", "IN", "INCLUDING", "INCREMENT", "INDEX", "INDEXED", "INDEXES", "INDICATOR", "IND_PARTITION", "INITIAL", "INITIALLY", "INITRANS", "INSERT", "INSTANCE", "INSTANCES", "INSTEAD", "INT", "INTEGER", "INTERMEDIATE", "INTERSECT", "INTO", "IS", "ISOLATION", "ISOLATION_LEVEL", "KEEP", "KEY", "KILL", "LABEL", "LAYER", "LESS", "LEVEL", "LIBRARY", "LIKE", "LIMIT", "LINK", "LIST", "LOB", "LOCAL", "LOCK", "LOCKED", "LOG", "LOGFILE", "LOGGING", "LOGICAL_READS_PER_CALL", "LOGICAL_READS_PER_SESSION", "LONG", "MANAGE", "MASTER", "MAX", "MAXARCHLOGS", "MAXDATAFILES", "MAXEXTENTS", "MAXINSTANCES", "MAXLOGFILES", "MAXLOGHISTORY", "MAXLOGMEMBERS", "MAXSIZE", "MAXTRANS", "MAXVALUE", "MIN", "MEMBER", "MINIMUM", "MINEXTENTS", "MINUS", "MINVALUE", "MLSLABEL", "MLS_LABEL_FORMAT", "MODE", "MODIFY", "MOUNT", "MOVE", "MTS_DISPATCHERS", "MULTISET", "NATIONAL", "NCHAR", "NCHAR_CS", "NCLOB", "NEEDED", "NESTED", "NETWORK", "NEW", "NEXT", "NOARCHIVELOG", "NOAUDIT", "NOCACHE", "NOCOMPRESS", "NOCYCLE", "NOFORCE", "NOLOGGING", "NOMAXVALUE", "NOMINVALUE", "NONE", "NOORDER", "NOOVERRIDE", "NOPARALLEL", "NOPARALLEL", "NOREVERSE", "NORMAL", "NOSORT", "NOT", "NOTHING", "NOWAIT", "NULL", "NUMBER", "NUMERIC", "NVARCHAR2", "OBJECT", "OBJNO", "OBJNO_REUSE", "OF", "OFF", "OFFLINE", "OID", "OIDINDEX", "OLD", "ON", "ONLINE", "ONLY", "OPCODE", "OPEN", "OPTIMAL", "OPTIMIZER_GOAL", "OPTION", "OR", "ORDER", "ORGANIZATION", "OSLABEL", "OVERFLOW", "OWN", "PACKAGE", "PARALLEL", "PARTITION", "PASSWORD", "PASSWORD_GRACE_TIME", "PASSWORD_LIFE_TIME", "PASSWORD_LOCK_TIME", "PASSWORD_REUSE_MAX", "PASSWORD_REUSE_TIME", "PASSWORD_VERIFY_FUNCTION", "PCTFREE", "PCTINCREASE", "PCTTHRESHOLD", "PCTUSED", "PCTVERSION", "PERCENT", "PERMANENT", "PLAN", "PLSQL_DEBUG", "POST_TRANSACTION", "PRECISION", "PRESERVE", "PRIMARY", "PRIOR", "PRIVATE", "PRIVATE_SGA", "PRIVILEGE", "PRIVILEGES", "PROCEDURE", "PROFILE", "PUBLIC", "PURGE", "QUEUE", "QUOTA", "RANGE", "RAW", "RBA", "READ", "READUP", "REAL", "REBUILD", "RECOVER", "RECOVERABLE", "RECOVERY", "REF", "REFERENCES", "REFERENCING", "REFRESH", "RENAME", "REPLACE", "RESET", "RESETLOGS", "RESIZE", "RESOURCE", "RESTRICTED", "RETURN", "RETURNING", "REUSE", "REVERSE", "REVOKE", "ROLE", "ROLES", "ROLLBACK", "ROW", "ROWID", "ROWNUM", "ROWS", "RULE", "SAMPLE", "SAVEPOINT", "SB4", "SCAN_INSTANCES", "SCHEMA", "SCN", "SCOPE", "SD_ALL", "SD_INHIBIT", "SD_SHOW", "SEGMENT", "SEG_BLOCK", "SEG_FILE", "SELECT", "SEQUENCE", "SERIALIZABLE", "SESSION", "SESSION_CACHED_CURSORS", "SESSIONS_PER_USER", "SET", "SHARE", "SHARED", "SHARED_POOL", "SHRINK", "SIZE", "SKIP", "SKIP_UNUSABLE_INDEXES", "SMALLINT", "SNAPSHOT", "SOME", "SORT", "SPECIFICATION", "SPLIT", "SQL_TRACE", "STANDBY", "START", "STATEMENT_ID", "STATISTICS", "STOP", "STORAGE", "STORE", "STRUCTURE", "SUCCESSFUL", "SWITCH", "SYS_OP_ENFORCE_NOT_NULL$", "SYS_OP_NTCIMG$", "SYNONYM", "SYSDATE", "SYSDBA", "SYSOPER", "SYSTEM", "TABLE", "TABLES", "TABLESPACE", "TABLESPACE_NO", "TABNO", "TEMPORARY", "THAN", "THE", "THEN", "THREAD", "TIMESTAMP", "TIME", "TO", "TOPLEVEL", "TRACE", "TRACING", "TRANSACTION", "TRANSITIONAL", "TRIGGER", "TRIGGERS", "TRUE", "TRUNCATE", "TX", "TYPE", "UB2", "UBA", "UID", "UNARCHIVED", "UNDO", "UNION", "UNIQUE", "UNLIMITED", "UNLOCK", "UNRECOVERABLE", "UNTIL", "UNUSABLE", "UNUSED", "UPDATABLE", "UPDATE", "USAGE", "USE", "USER", "USING", "VALIDATE", "VALIDATION", "VALUE", "VALUES", "VARCHAR", "VARCHAR2", "VARYING", "VIEW", "WHEN", "WHENEVER", "WHERE", "WITH", "WITHOUT", "WORK", "WRITE", "WRITEDOWN", "WRITEUP", "XID", "YEAR", "ZONE"];

const RESERVED_WORDS_MONGO = ["DOCUMENT"];

const SUPPORTED_VALIDATION_RULES = ['required', 'max', 'min', 'maxlength', 'minlength', 'maxbytes', 'minbytes', 'pattern'];

// enum-specific vars
var enums = [];

var existingEnum = false;

var fieldNamesUnderscored = ['id'];
var fieldNameChoices = [], relNameChoices = []; // this variable will hold field and relationship names for question options during update
var databaseType;
var prodDatabaseType;
const INTERPOLATE_REGEX = /<%=([\s\S]+?)%>/g; // so that thymeleaf tags in templates do not get mistreated as _ templates
const RESOURCE_DIR = 'src/main/resources/';
const ANGULAR_DIR = 'src/main/webapp/app/';

var EntityGenerator = generators.Base.extend({});

util.inherits(EntityGenerator, scriptBase);

module.exports = EntityGenerator.extend({
    constructor: function() {
        generators.Base.apply(this, arguments);

        // This makes `name` a required argument.
        this.argument('name', {
            type: String,
            required: true,
            description: 'Entity name'
        });
        // remove extention if feeding json files
        this.name = this.name.replace('.json', '');
        // This method adds support for a `--[no-]regenerate` flag
        this.option('regenerate', {
            desc: 'regenerate the entity without presenting an option to update it',
            type: Boolean,
            defaults: false
        });
        this.regenerate = this.options['regenerate'];
    },
    initializing: {
        getConfig: function(args) {
            this.useConfigurationFile = false;
            this.env.options.appPath = this.config.get('appPath') || 'src/main/webapp';
            this.baseName = this.config.get('baseName');
            this.packageName = this.config.get('packageName');
            this.packageFolder = this.config.get('packageFolder');
            this.authenticationType = this.config.get('authenticationType');
            this.hibernateCache = this.config.get('hibernateCache');
            this.databaseType = this.config.get('databaseType');
            this.prodDatabaseType = this.config.get('prodDatabaseType');
            this.searchEngine = this.config.get('searchEngine');
            this.enableTranslation = this.config.get('enableTranslation');
            this.buildTool = this.config.get('buildTool');
            this.testFrameworks = this.config.get('testFrameworks');
            this.skipClient = this.config.get('skipClient');
            // backward compatibility on testing frameworks
            if (this.testFrameworks == null) {
                this.testFrameworks = ['gatling'];
            }
            this.angularAppName = _s.camelize(_s.slugify(this.baseName)) + 'App';
            this.jhipsterConfigDirectory = '.jhipster';

            this.filename = this.jhipsterConfigDirectory + '/' + _s.capitalize(this.name) + '.json';
            if (shelljs.test('-f', this.filename)) {
                this.log(chalk.green('\nFound the ' + this.filename + ' configuration file, entity can be automatically generated!\n'));
                try {
                    this.fileData = this.fs.readJSON(this.filename);
                } catch (err) {
                    this.log(chalk.red('\nThe configuration file could not be read!\n'));
                    return;
                }
                this.useConfigurationFile = true;
            }
        },

        validateEntityName: function() {
            databaseType = this.databaseType;
            prodDatabaseType = this.prodDatabaseType;
            if (!(/^([a-zA-Z0-9_]*)$/.test(this.name))) {
                this.env.error(chalk.red('The entity name cannot contain special characters'));
            } else if (this.name == '') {
                this.env.error(chalk.red('The entity name cannot be empty'));
            } else if (this.name.indexOf("Detail", this.name.length - "Detail".length) !== -1) {
                this.env.error(chalk.red('The entity name cannot end with \'Detail\''));
            } else if (RESERVED_WORDS_JAVA.indexOf(this.name.toUpperCase()) != -1) {
                this.env.error(chalk.red('The entity name cannot contain a Java reserved keyword'));
            } else if (prodDatabaseType == 'mysql' && RESERVED_WORDS_MYSQL.indexOf(this.name.toUpperCase()) != -1) {
                this.env.error(chalk.red('The entity name cannot contain a MySQL reserved keyword'));
            } else if (prodDatabaseType == 'postgresql' && RESERVED_WORDS_POSGRES.indexOf(this.name.toUpperCase()) != -1) {
                this.env.error(chalk.red('The entity name cannot contain a PostgreSQL reserved keyword'));
            } else if (prodDatabaseType == 'cassandra' && RESERVED_WORDS_CASSANDRA.indexOf(this.name.toUpperCase()) != -1) {
                this.env.error(chalk.red('The entity name cannot contain a Cassandra reserved keyword'));
            } else if (prodDatabaseType == 'oracle' && RESERVED_WORDS_ORACLE.indexOf(this.name.toUpperCase()) != -1) {
                this.env.error(chalk.red('The entity name cannot contain a Oracle reserved keyword'));
            } else if (prodDatabaseType == 'oracle' && _s.underscored(this.name).length > 26) {
                this.env.error(chalk.red('The entity name is too long for Oracle, try a shorter name'));
            } else if (prodDatabaseType == 'mongodb' && RESERVED_WORDS_MONGO.indexOf(this.name.toUpperCase()) != -1) {
                this.env.error(chalk.red('The entity name cannot contain a MongoDB reserved keyword'));
            }
        },

        setupVars: function() {
            // Specific Entity sub-generator variables
            if (!this.useConfigurationFile) {
                //no file present, new entity creation
                this.log(chalk.red('\nThe entity ' + this.name + ' is being created.\n'));
                this.fieldId = 0;
                this.fields = [];
                this.relationshipId = 0;
                this.relationships = [];
                this.pagination = 'no';
                this.validation = false;
                this.dto = 'no';
                this.service = 'no';
            } else {
                //existing entity reading values from file
                this.log(chalk.red('\nThe entity ' + this.name + ' is being updated.\n'));
                this.fieldId = this.fileData.fields? this.fileData.fields.length : 0;
                this.relationshipId = this.fileData.relationships? this.fileData.relationships.length : 0;
                this.relationships = this.fileData.relationships;
                this.fields = this.fileData.fields;
                this.changelogDate = this.fileData.changelogDate;
                this.dto = this.fileData.dto;
                this.service = this.fileData.service;
                this.pagination = this.fileData.pagination;
                this.javadoc = this.fileData.javadoc;
                this.fields && this.fields.forEach(function (field) {
                    fieldNamesUnderscored.push(_s.underscored(field.fieldName));
                    fieldNameChoices.push({name: field.fieldName, value: field.fieldName});
                }, this);
                this.relationships && this.relationships.forEach(function (rel) {
                    relNameChoices.push({name: rel.relationshipName + ':' + rel.relationshipType, value: rel.relationshipName + ':' + rel.relationshipType});
                }, this);
            }
        }
    },

    /* private Helper methods */
    /**
     * ask question for a field creation
     */
    _askForField : function(cb){
        this.fieldId++;
        this.log(chalk.green('\nGenerating field #' + this.fieldId + '\n'));
        var prompts = [
            {
                type: 'confirm',
                name: 'fieldAdd',
                message: 'Do you want to add a field to your entity?',
                default: true
            },
            {
                when: function(response) {
                    return response.fieldAdd == true;
                },
                type: 'input',
                name: 'fieldName',
                validate: function(input) {
                    if (!(/^([a-zA-Z0-9_]*)$/.test(input))) {
                        return 'Your field name cannot contain special characters';
                    } else if (input == '') {
                        return 'Your field name cannot be empty';
                    } else if (input.charAt(0) == input.charAt(0).toUpperCase()) {
                        return 'Your field name cannot start with a upper case letter';
                    } else if (input == 'id' || fieldNamesUnderscored.indexOf(_s.underscored(input)) != -1) {
                        return 'Your field name cannot use an already existing field name';
                    } else if (RESERVED_WORDS_JAVA.indexOf(input.toUpperCase()) != -1) {
                        return 'Your field name cannot contain a Java reserved keyword';
                    } else if (prodDatabaseType == 'mysql' && RESERVED_WORDS_MYSQL.indexOf(input.toUpperCase()) != -1) {
                        return 'Your field name cannot contain a MySQL reserved keyword';
                    } else if (prodDatabaseType == 'postgresql' && RESERVED_WORDS_POSGRES.indexOf(input.toUpperCase()) != -1) {
                        return 'Your field name cannot contain a PostgreSQL reserved keyword';
                    } else if (prodDatabaseType == 'cassandra' && RESERVED_WORDS_CASSANDRA.indexOf(input.toUpperCase()) != -1) {
                        return 'Your field name cannot contain a Cassandra reserved keyword';
                    } else if (prodDatabaseType == 'oracle' && RESERVED_WORDS_ORACLE.indexOf(input.toUpperCase()) != -1) {
                        return 'Your field name cannot contain a Oracle reserved keyword';
                    } else if (prodDatabaseType == 'oracle' && input.length > 30) {
                        return 'The field name cannot be of more than 30 characters';
                    } else if (prodDatabaseType == 'mongodb' && RESERVED_WORDS_MONGO.indexOf(input.toUpperCase()) != -1) {
                        return 'Your field name cannot contain a MongoDB reserved keyword';
                    }
                    return true;
                },
                message: 'What is the name of your field?'
            },
            {
                when: function(response) {
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
                when: function(response) {
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
                validate: function(input) {
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
                when: function(response) {
                    return response.fieldIsEnum;
                },
                type: 'input',
                name: 'fieldValues',
                validate: function(input) {
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
                when: function(response) {
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
                when: function(response) {
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
                    },
                    {
                        value: 'text',
                        name: 'A CLOB (Text field)'
                    }
                ],
                default: 0
            },
            {
                when: function(response) {
                    return response.fieldAdd == true;
                },
                type: 'confirm',
                name: 'fieldValidate',
                message: 'Do you want to add validation rules to your field?',
                default: false
            },
            {
                when: function(response) {
                    return response.fieldAdd == true &&
                    response.fieldValidate == true &&
                    response.fieldType == 'String';
                },
                type: 'checkbox',
                name: 'fieldValidateRules',
                message: 'Which validation rules do you want to add?',
                choices: [
                    {
                        name: 'Required',
                        value: 'required'
                    },
                    {
                        name: 'Minimum length',
                        value: 'minlength'
                    },
                    {
                        name: 'Maximum length',
                        value: 'maxlength'
                    },
                    {
                        name: 'Regular expression pattern',
                        value: 'pattern'
                    }
                ],
                default: 0
            },
            {
                when: function(response) {
                    return response.fieldAdd == true &&
                    response.fieldValidate == true &&
                    (response.fieldType == 'Integer' ||
                    response.fieldType == 'Long' ||
                    response.fieldType == 'Float' ||
                    response.fieldType == 'Double' ||
                    response.fieldType == 'BigDecimal' ||
                    response.fieldTypeBlobContent == 'text');
                },
                type: 'checkbox',
                name: 'fieldValidateRules',
                message: 'Which validation rules do you want to add?',
                choices: [
                    {
                        name: 'Required',
                        value: 'required'
                    },
                    {
                        name: 'Minimum',
                        value: 'min'
                    },
                    {
                        name: 'Maximum',
                        value: 'max'
                    }
                ],
                default: 0
            },
            {
                when: function(response) {
                    return response.fieldAdd == true &&
                    response.fieldValidate == true &&
                    response.fieldType == 'byte[]' &&
                    response.fieldTypeBlobContent != 'text';
                },
                type: 'checkbox',
                name: 'fieldValidateRules',
                message: 'Which validation rules do you want to add?',
                choices: [
                    {
                        name: 'Required',
                        value: 'required'
                    },
                    {
                        name: 'Minimum byte size',
                        value: 'minbytes'
                    },
                    {
                        name: 'Maximum byte size',
                        value: 'maxbytes'
                    }
                ],
                default: 0
            },
            {
                when: function(response) {
                    return response.fieldAdd == true &&
                    response.fieldValidate == true &&
                    (response.fieldType == 'LocalDate' ||
                    response.fieldType == 'ZonedDateTime' ||
                    response.fieldType == 'UUID' ||
                    response.fieldType == 'Date' ||
                    response.fieldType == 'Boolean' ||
                    response.fieldTypeBlobContent == 'text' ||
                    response.fieldIsEnum == true);
                },
                type: 'checkbox',
                name: 'fieldValidateRules',
                message: 'Which validation rules do you want to add?',
                choices: [
                    {
                        name: 'Required',
                        value: 'required'
                    }
                ],
                default: 0
            },
            {
                when: function(response) {
                    return response.fieldAdd == true &&
                    response.fieldValidate == true &&
                    response.fieldValidateRules.indexOf('minlength') != -1;
                },
                type: 'input',
                name: 'fieldValidateRulesMinlength',
                validate: function(input) {
                    if (/^([0-9]*)$/.test(input)) return true;
                    return 'Minimum length must be a number';
                },
                message: 'What is the minimum length of your field?',
                default: 0
            },
            {
                when: function(response) {
                    return response.fieldAdd == true &&
                    response.fieldValidate == true &&
                    response.fieldValidateRules.indexOf('maxlength') != -1;
                },
                type: 'input',
                name: 'fieldValidateRulesMaxlength',
                validate: function(input) {
                    if (/^([0-9]*)$/.test(input)) return true;
                    return 'Maximum length must be a number';
                },
                message: 'What is the maximum length of your field?',
                default: 20
            },
            {
                when: function(response) {
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
                when: function(response) {
                    return response.fieldAdd == true &&
                    response.fieldValidate == true &&
                    response.fieldValidateRules.indexOf('min') != -1 &&
                    (response.fieldType == 'Integer' ||
                    response.fieldType == 'Long' ||
                    response.fieldType == 'Float' ||
                    response.fieldType == 'Double' ||
                    response.fieldTypeBlobContent == 'text' ||
                    response.fieldType == 'BigDecimal');
                },
                type: 'input',
                name: 'fieldValidateRulesMin',
                message: 'What is the minimum of your field?',
                validate: function(input) {
                    if (/^([0-9]*)$/.test(input)) return true;
                    return 'Minimum must be a number';
                },
                default: 0
            },
            {
                when: function(response) {
                    return response.fieldAdd == true &&
                    response.fieldValidate == true &&
                    response.fieldValidateRules.indexOf('max') != -1 &&
                    (response.fieldType == 'Integer' ||
                    response.fieldType == 'Long' ||
                    response.fieldType == 'Float' ||
                    response.fieldType == 'Double' ||
                    response.fieldTypeBlobContent == 'text' ||
                    response.fieldType == 'BigDecimal');
                },
                type: 'input',
                name: 'fieldValidateRulesMax',
                message: 'What is the maximum of your field?',
                validate: function(input) {
                    if (/^([0-9]*)$/.test(input)) return true;
                    return 'Maximum must be a number';
                },
                default: 100
            },
            {
                when: function(response) {
                    return response.fieldAdd == true &&
                    response.fieldValidate == true &&
                    response.fieldValidateRules.indexOf('minbytes') != -1 &&
                    response.fieldType == 'byte[]' &&
                    response.fieldTypeBlobContent != 'text';
                },
                type: 'input',
                name: 'fieldValidateRulesMinbytes',
                message: 'What is the minimum byte size of your field?',
                validate: function(input) {
                    if (/^([0-9]*)$/.test(input)) return true;
                    return 'Minimum byte size must be a number';
                },
                default: 0
            },
            {
                when: function(response) {
                    return response.fieldAdd == true &&
                    response.fieldValidate == true &&
                    response.fieldValidateRules.indexOf('maxbytes') != -1 &&
                    response.fieldType == 'byte[]' &&
                    response.fieldTypeBlobContent != 'text';
                },
                type: 'input',
                name: 'fieldValidateRulesMaxbytes',
                message: 'What is the maximum byte size of your field?',
                validate: function(input) {
                    if (/^([0-9]*)$/.test(input)) return true;
                    return 'Maximum byte size must be a number';
                },
                default: 5000000
            }
        ];
        this.prompt(prompts, function(props) {
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
            this.log(chalk.red('\n=================' + _s.capitalize(this.name) + '================='));
            this.fields.forEach(function(field) {
                var validationDetails = '';
                var fieldValidate = _.isArray(field.fieldValidateRules) && field.fieldValidateRules.length >= 1;
                if (fieldValidate == true) {
                    if (field.fieldValidateRules.indexOf('required') != -1) {
                        validationDetails = 'required ';
                    }
                    if (field.fieldValidateRules.indexOf('minlength') != -1) {
                        validationDetails += 'minlength=\'' + field.fieldValidateRulesMinlength + '\' ';
                    }
                    if (field.fieldValidateRules.indexOf('maxlength') != -1) {
                        validationDetails += 'maxlength=\'' + field.fieldValidateRulesMaxlength + '\' ';
                    }
                    if (field.fieldValidateRules.indexOf('pattern') != -1) {
                        validationDetails += 'pattern=\'' + field.fieldValidateRulesPattern + '\' ';
                    }
                    if (field.fieldValidateRules.indexOf('min') != -1) {
                        validationDetails += 'min=\'' + field.fieldValidateRulesMin + '\' ';
                    }
                    if (field.fieldValidateRules.indexOf('max') != -1) {
                        validationDetails += 'max=\'' + field.fieldValidateRulesMax + '\' ';
                    }
                    if (field.fieldValidateRules.indexOf('minbytes') != -1) {
                        validationDetails += 'minbytes=\'' + field.fieldValidateRulesMinbytes + '\' ';
                    }
                    if (field.fieldValidateRules.indexOf('maxbytes') != -1) {
                        validationDetails += 'maxbytes=\'' + field.fieldValidateRulesMaxbytes + '\' ';
                    }
                }
                this.log(chalk.red(field.fieldName) + chalk.white(' (' + field.fieldType + (field.fieldTypeBlobContent ? ' ' + field.fieldTypeBlobContent : '') + ') ') + chalk.cyan(validationDetails));
            }, this);
            if (props.fieldAdd) {
                this._askForField(cb);
            } else {
                cb();
            }
        }.bind(this));
    },
    /**
     * ask question for field deletion
     */
    _askForFieldsToRemove : function(cb){
        var prompts = [
            {
                type: 'checkbox',
                name: 'fieldsToRemove',
                message: 'Please choose the fields you want to remove',
                choices: fieldNameChoices,
                default: 'none'
            },
            {
                when: function(response) {
                    return response.fieldsToRemove != 'none';
                },
                type: 'confirm',
                name: 'confirmRemove',
                message: 'Are you sure to remove these fields?',
                default: true
            }
        ];
        this.prompt(prompts, function(props) {
            if (props.confirmRemove) {
                this.log(chalk.red('\nRemoving fields: ' + props.fieldsToRemove + '\n'));
                var i;
                for (i = this.fields.length - 1; i >= 0; i -= 1) {
                    var field = this.fields[i];
                    if(props.fieldsToRemove.filter(function (val) {
                        return val == field.fieldName;
                    }).length > 0){
                        this.fields.splice(i, 1);
                    }
                }
                //reset field IDs
                for (i = 0; i < this.fields.length; i++) {
                    this.fields[i].fieldId = i;
                }
                this.fieldId = this.fields.length;
            }
            cb();

        }.bind(this));
    },
    /**
     * ask question for a relationship creation
     */
    _askForRelationship: function(cb){
        var packageFolder = this.packageFolder;
        var name = this.name;
        this.relationshipId++;
        this.log(chalk.green('\nGenerating relationships with other entities\n'));
        var prompts = [
            {
                type: 'confirm',
                name: 'relationshipAdd',
                message: 'Do you want to add a relationship to another entity?',
                default: true
            },
            {
                when: function(response) {
                    return response.relationshipAdd == true;
                },
                type: 'input',
                name: 'otherEntityName',
                validate: function(input) {
                    if (!(/^([a-zA-Z0-9_]*)$/.test(input))) {
                        return 'Your other entity name cannot contain special characters';
                    } else if (input == '') {
                        return 'Your other entity name cannot be empty';
                    } else if (RESERVED_WORDS_JAVA.indexOf(input.toUpperCase()) != -1) {
                        return 'Your other entity name cannot contain a Java reserved keyword';
                    }
                    return true;
                },
                message: 'What is the name of the other entity?'
            },
            {
                when: function(response) {
                    return response.relationshipAdd == true;
                },
                type: 'input',
                name: 'relationshipName',
                validate: function(input) {
                    if (!(/^([a-zA-Z0-9_]*)$/.test(input))) {
                        return 'Your relationship cannot contain special characters';
                    } else if (input == '') {
                        return 'Your relationship cannot be empty';
                    } else if (input == 'id' || fieldNamesUnderscored.indexOf(_s.underscored(input)) != -1) {
                        return 'Your relationship cannot use an already existing field name';
                    } else if (RESERVED_WORDS_JAVA.indexOf(input.toUpperCase()) != -1) {
                        return 'Your relationship cannot contain a Java reserved keyword';
                    }
                    return true;
                },
                message: 'What is the name of the relationship?',
                default: function(response) {
                    return _s.decapitalize(response.otherEntityName);
                }
            },
            {
                when: function(response) {
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
                when: function(response) {
                    return (response.relationshipAdd == true && (response.relationshipType == 'many-to-many' || response.relationshipType == 'one-to-one'));
                },
                type: 'confirm',
                name: 'ownerSide',
                message: 'Is this entity the owner of the relationship?',
                default: false
            },
            {
                when: function(response) {
                    return (response.relationshipAdd == true && (response.relationshipType == 'one-to-many' ||
                    (response.relationshipType == 'many-to-many' && response.ownerSide == false) ||
                    (response.relationshipType == 'one-to-one' && response.otherEntityName.toLowerCase() != "user")));
                },
                type: 'input',
                name: 'otherEntityRelationshipName',
                message: 'What is the name of this relationship in the other entity?',
                default: function(response) {
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
                when: function(response) {
                    return (!(response.noOtherEntity == false || response.noOtherEntity2 == false) && response.relationshipAdd == true && (response.relationshipType == 'many-to-one' || (response.relationshipType == 'many-to-many' && response.ownerSide == true) || (response.relationshipType == 'one-to-one' && response.ownerSide == true)));
                },
                type: 'input',
                name: 'otherEntityField',
                message: function(response) {
                    return 'When you display this relationship with AngularJS, which field from \'' + response.otherEntityName + '\' do you want to use?'
                },
                default: 'id'
            }
        ];
        this.prompt(prompts, function(props) {
            if (props.noOtherEntity == false || props.noOtherEntity2 == false) {
                this.log(chalk.red('\nGeneration aborted, as requested by the user.\n'));
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
            this.log(chalk.red('\n===========' + _s.capitalize(this.name) + '=============='));
            this.fields.forEach(function(field) {
                this.log(chalk.red(field.fieldName + ' (' + field.fieldType + (field.fieldTypeBlobContent ? ' ' + field.fieldTypeBlobContent : '') + ')'));
            }, this);
            this.log(chalk.red('-------------------'));
            this.relationships.forEach(function(relationship) {
                this.log(chalk.red(relationship.relationshipName + ' - ' + relationship.otherEntityName + ' (' + relationship.relationshipType + ')'));
            }, this);
            if (props.relationshipAdd) {
                this._askForRelationship(cb);
            } else {
                this.log('\n')
                cb();
            }
        }.bind(this));
    },
    /**
     * ask question for relationship deletion
     */
    _askForRelationsToRemove : function(cb){
        var prompts = [
            {
                type: 'checkbox',
                name: 'relsToRemove',
                message: 'Please choose the relationships you want to remove',
                choices: relNameChoices,
                default: 'none'
            },
            {
                when: function(response) {
                    return response.relsToRemove != 'none';
                },
                type: 'confirm',
                name: 'confirmRemove',
                message: 'Are you sure to remove these relationships?',
                default: true
            }
        ];
        this.prompt(prompts, function(props) {
            if (props.confirmRemove) {
                this.log(chalk.red('\nRemoving relationships: ' + props.relsToRemove + '\n'));
                var i;
                for (i = this.relationships.length - 1; i >= 0; i -= 1) {
                    var rel = this.relationships[i];
                    if(props.relsToRemove.filter(function (val) {
                        return val == rel.relationshipName + ':' + rel.relationshipType;
                    }).length > 0){
                        this.relationships.splice(i, 1);
                    }
                }
                //reset relationship IDs
                for (i = 0; i < this.relationships.length; i++) {
                    this.relationships[i].relationshipId = i;
                }
                this.relationshipId = this.relationships.length;
            }
            cb();

        }.bind(this));
    },

    /* end of Helper methods */

    prompting: {
        /* pre entity hook needs to be written here */
        /* ask question to user if s/he wants to update entity */
        askForUpdate: function () {
            // ask only if running an existing entity without arg option --force or --regenerate
            var isForce = this.options['force'] || this.regenerate;
            this.updateEntity = 'regenerate'; // default if skipping questions by --force
            if (isForce || !this.useConfigurationFile) {
                return;
            }
            var cb = this.async();
            var prompts = [
                {
                    type: 'list',
                    name: 'updateEntity',
                    message: 'Do you want to update the entity? This will replace the existing files for this entity, all your custom code will be overwritten',
                    choices: [
                        {
                            value: 'regenerate',
                            name: 'Yes, re generate the entity'
                        },
                        {
                            value: 'add',
                            name: '[BETA] Yes, add more fields and relationships'
                        },
                        {
                            value: 'remove',
                            name: '[BETA] Yes, remove fields and relationships'
                        },
                        {
                            value: 'none',
                            name: 'No, exit'
                        },
                    ],
                    default: 0
                }
            ];
            this.prompt(prompts, function(props) {
                this.updateEntity = props.updateEntity;
                if(this.updateEntity == 'none'){
                    this.env.error(chalk.green('Aborting entity update, no changes were made.'));
                }
                cb();

            }.bind(this));
        },

        askForFields: function() {
            // don't prompt if data is imported from a file
            if (this.useConfigurationFile && this.updateEntity != 'add') {
                return;
            }
            var cb = this.async();

            this._askForField(cb);
        },

        askForFieldsToRemove: function() {
            // prompt only if data is imported from a file
            if (!this.useConfigurationFile || this.updateEntity != 'remove') {
                return;
            }
            var cb = this.async();

            this._askForFieldsToRemove(cb);
        },

        askForRelationships: function() {
            // don't prompt if data is imported from a file
            if (this.useConfigurationFile && this.updateEntity != 'add') {
                return;
            }
            if (this.databaseType == 'mongodb' || this.databaseType == 'cassandra') {
                return;
            }

            var cb = this.async();

            this._askForRelationship(cb);
        },

        askForRelationsToRemove: function() {
            // prompt only if data is imported from a file
            if (!this.useConfigurationFile || this.updateEntity != 'remove') {
                return;
            }
            if (this.databaseType == 'mongodb' || this.databaseType == 'cassandra') {
                return;
            }

            var cb = this.async();

            this._askForRelationsToRemove(cb);
        },

        askForDTO: function() {
            // don't prompt if data is imported from a file
            if (this.useConfigurationFile) {
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
            this.prompt(prompts, function(props) {
                this.dto = props.dto;
                cb();
            }.bind(this));
        },

        askForService: function() {
            // don't prompt if data are imported from a file
            if (this.useConfigurationFile) {
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
            this.prompt(prompts, function(props) {
                this.service = props.service;
                cb();
            }.bind(this));
        },

        askForPagination: function() {
            // don't prompt if data are imported from a file
            if (this.useConfigurationFile) {
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
            this.prompt(prompts, function(props) {
                this.pagination = props.pagination;
                this.log(chalk.green('\nEverything is configured, generating the entity...\n'));
                cb();
            }.bind(this));
        }
    },

    configuring : {

        validateFile: function() {

            if (!this.useConfigurationFile) {
                return;
            }
            // Validate entity json field content
            for (var idx in this.fields) {
                var field = this.fields[idx];
                if (_.isUndefined(field.fieldId)) {
                    this.env.error(chalk.red('ERROR fieldId is missing in .jhipster/' + this.name + '.json for field ' + JSON.stringify(field, null, 4)));
                }

                if (_.isUndefined(field.fieldName)) {
                    this.env.error(chalk.red('ERROR fieldName is missing in .jhipster/' + this.name + '.json for field with id ' + field.fieldId));
                }

                if (_.isUndefined(field.fieldType)) {
                    this.env.error(chalk.red('ERROR fieldType is missing in .jhipster/' + this.name + '.json for field with id ' + field.fieldId));
                }

                if (!_.isUndefined(field.fieldValidateRules)) {
                    if (!_.isArray(field.fieldValidateRules)) {
                        this.env.error(chalk.red('ERROR fieldValidateRules is not an array in .jhipster/' + this.name + '.json for field with id ' + field.fieldId));
                    }
                    for (var idxRules in field.fieldValidateRules) {
                        var fieldValidateRule = field.fieldValidateRules[idxRules];
                        if (!_.contains(SUPPORTED_VALIDATION_RULES, fieldValidateRule)) {
                            this.env.error(chalk.red('ERROR fieldValidateRules contains unknown validation rule ' + fieldValidateRule + ' in .jhipster/' + this.name + '.json for field with id ' + field.fieldId + ' [supported validation rules ' + SUPPORTED_VALIDATION_RULES + ']'));
                        }
                    }
                    if (_.contains(field.fieldValidateRules, 'max') && _.isUndefined(field.fieldValidateRulesMax)) {
                        this.env.error(chalk.red('ERROR fieldValidateRulesMax is missing in .jhipster/' + this.name + '.json for field with id ' + field.fieldId));
                    }
                    if (_.contains(field.fieldValidateRules, 'min') && _.isUndefined(field.fieldValidateRulesMin)) {
                        this.env.error(chalk.red('ERROR fieldValidateRulesMin is missing in .jhipster/' + this.name + '.json for field with id ' + field.fieldId));
                    }
                    if (_.contains(field.fieldValidateRules, 'maxlength') && _.isUndefined(field.fieldValidateRulesMaxlength)) {
                        this.env.error(chalk.red('ERROR fieldValidateRulesMaxlength is missing in .jhipster/' + this.name + '.json for field with id ' + field.fieldId));
                    }
                    if (_.contains(field.fieldValidateRules, 'minlength') && _.isUndefined(field.fieldValidateRulesMinlength)) {
                        this.env.error(chalk.red('ERROR fieldValidateRulesMinlength is missing in .jhipster/' + this.name + '.json for field with id ' + field.fieldId));
                    }
                    if (_.contains(field.fieldValidateRules, 'maxbytes') && _.isUndefined(field.fieldValidateRulesMaxbytes)) {
                        this.env.error(chalk.red('ERROR fieldValidateRulesMaxbytes is missing in .jhipster/' + this.name + '.json for field with id ' + field.fieldId));
                    }
                    if (_.contains(field.fieldValidateRules, 'minbytes') && _.isUndefined(field.fieldValidateRulesMinbytes)) {
                        this.env.error(chalk.red('ERROR fieldValidateRulesMinbytes is missing in .jhipster/' + this.name + '.json for field with id ' + field.fieldId));
                    }
                    if (_.contains(field.fieldValidateRules, 'pattern') && _.isUndefined(field.fieldValidateRulesPattern)) {
                        this.env.error(chalk.red('ERROR fieldValidateRulesPattern is missing in .jhipster/' + this.name + '.json for field with id ' + field.fieldId));
                    }
                }
            }

            // Validate entity json relationship content
            for (var idx in this.relationships) {
                var relationship = this.relationships[idx];
                if (_.isUndefined(relationship.relationshipId)) {
                    this.env.error(chalk.red('ERROR relationshipId is missing in .jhipster/' + this.name + '.json for relationship ' + JSON.stringify(relationship, null, 4)));
                }

                if (_.isUndefined(relationship.relationshipName)) {
                    relationship.relationshipName = relationship.otherEntityName;
                    this.log(chalk.yellow('WARNING relationshipName is missing in .jhipster/' + this.name + '.json for relationship with id ' + relationship.relationshipId + ', using ' + relationship.otherEntityName + ' as fallback'));
                }

                if (_.isUndefined(relationship.otherEntityName)) {
                    this.env.error(chalk.red('ERROR otherEntityName is missing in .jhipster/' + this.name + '.json for relationship with id ' + relationship.relationshipId));
                }

                if (_.isUndefined(relationship.otherEntityRelationshipName)
                && (relationship.relationshipType == 'one-to-many' || (relationship.relationshipType == 'many-to-many' && relationship.ownerSide == false) || (relationship.relationshipType == 'one-to-one'))) {
                    relationship.otherEntityRelationshipName = _s.decapitalize(this.name);
                    this.log(chalk.yellow('WARNING otherEntityRelationshipName is missing in .jhipster/' + this.name + '.json for relationship with id ' + relationship.relationshipId + ', using ' + _s.decapitalize(this.name) + ' as fallback'));
                }

                if (_.isUndefined(relationship.otherEntityField)
                && (relationship.relationshipType == 'many-to-one' || (relationship.relationshipType == 'many-to-many' && relationship.ownerSide == true) || (relationship.relationshipType == 'one-to-one' && relationship.ownerSide == true))) {
                    this.log(chalk.yellow('WARNING otherEntityField is missing in .jhipster/' + this.name + '.json for relationship with id ' + relationship.relationshipId + ', using id as fallback'));
                    relationship.otherEntityField = 'id';
                }

                if (_.isUndefined(relationship.relationshipType)) {
                    this.env.error(chalk.red('ERROR relationshipType is missing in .jhipster/' + this.name + '.json for relationship with id ' + relationship.relationshipId));
                }

                if (_.isUndefined(relationship.ownerSide)
                && (relationship.relationshipType == 'one-to-one' || relationship.relationshipType == 'many-to-many')) {
                    this.env.error(chalk.red('ERROR ownerSide is missing in .jhipster/' + this.name + '.json for relationship with id ' + relationship.relationshipId));
                }
            }

            // Validate root entity json content
            if (_.isUndefined(this.changelogDate)
            && (this.databaseType == "sql" || this.databaseType == "cassandra")) {
                var currentDate = this.dateFormatForLiquibase();
                this.log(chalk.yellow('WARNING changelogDate is missing in .jhipster/' + this.name + '.json, using ' + currentDate + ' as fallback'));
                this.changelogDate = currentDate;
            }
            if (_.isUndefined(this.dto)) {
                this.log(chalk.yellow('WARNING dto is missing in .jhipster/' + this.name + '.json, using no as fallback'));
                this.dto = 'no';
            }
            if (_.isUndefined(this.service)) {
                this.log(chalk.yellow('WARNING service is missing in .jhipster/' + this.name + '.json, using no as fallback'));
                this.service = 'no';
            }
            if (_.isUndefined(this.pagination)) {
                if (databaseType == 'sql' || databaseType == 'mongodb') {
                    this.log(chalk.yellow('WARNING pagination is missing in .jhipster/' + this.name + '.json, using no as fallback'));
                    this.pagination = 'no';
                } else {
                    this.pagination = 'no';
                }
            }

        },

        writeEntityJson: function () {
            if (this.useConfigurationFile && this.updateEntity == 'regenerate') {
                return; //do not update if regenerating entity
            }
             // store informations in a file for further use.
            if (!this.useConfigurationFile && (this.databaseType == "sql" || this.databaseType == "cassandra")) {
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
            this.data.javadoc = this.javadoc;
            this.fs.writeJSON(this.filename, this.data, null, 4);
        },

        LoadInMemoryData: function() {

            // Load in-memory data for fields
            for (var idx in this.fields) {
                var field = this.fields[idx];

                // Migration from JodaTime to Java Time
                if (field.fieldType == 'DateTime') {
                    field.fieldType = 'ZonedDateTime';
                }
                var nonEnumType = _.contains(['String', 'Integer', 'Long', 'Float', 'Double', 'BigDecimal',
                'LocalDate', 'ZonedDateTime', 'Boolean', 'byte[]'], field.fieldType);
                if ((databaseType == 'sql' || databaseType == 'mongodb') && !nonEnumType) {
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
            this.entityClassPlural = pluralize(this.entityClass);
            this.entityInstance = _s.decapitalize(this.name);
            this.entityInstancePlural = pluralize(this.entityInstance);
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
        },

        insight: function() {
            // track insights
            var insight = this.insight();

            insight.track('generator', 'entity');
            insight.track('entity/fields', this.fields.length);
            insight.track('entity/relationships', this.relationships.length);
            insight.track('entity/pagination', this.pagination);
            insight.track('entity/dto', this.dto);
            insight.track('entity/service', this.service);
        }
    },

    writing : {

        writeEnumFiles: function() {

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
                    if (!this.skipClient && this.enableTranslation) {
                        this.getAllInstalledLanguages().forEach(function(language) {
                            this.copyEnumI18n(language, enumInfo);
                        }, this);
                    }

                }
            }
        },

        writeServerFiles: function() {

            this.template('src/main/java/package/domain/_Entity.java',
            'src/main/java/' + this.packageFolder + '/domain/' + this.entityClass + '.java', this, {});

            this.template('src/main/java/package/repository/_EntityRepository.java',
            'src/main/java/' + this.packageFolder + '/repository/' + this.entityClass + 'Repository.java', this, {});

            if (this.searchEngine == 'elasticsearch') {
                this.template('src/main/java/package/repository/search/_EntitySearchRepository.java',
                'src/main/java/' + this.packageFolder + '/repository/search/' + this.entityClass + 'SearchRepository.java', this, {});
            }

            this.template('src/main/java/package/web/rest/_EntityResource.java',
            'src/main/java/' + this.packageFolder + '/web/rest/' + this.entityClass + 'Resource.java', this, {});
            if (this.service == 'serviceImpl') {
                this.template('src/main/java/package/service/_EntityService.java',
                'src/main/java/' + this.packageFolder + '/service/' + this.entityClass + 'Service.java', this, {});
                this.template('src/main/java/package/service/impl/_EntityServiceImpl.java',
                'src/main/java/' + this.packageFolder + '/service/impl/' + this.entityClass + 'ServiceImpl.java', this, {});
            } else if (this.service == 'serviceClass') {
                this.template('src/main/java/package/service/impl/_EntityServiceImpl.java',
                'src/main/java/' + this.packageFolder + '/service/' + this.entityClass + 'Service.java', this, {});
            }
            if (this.dto == 'mapstruct') {
                this.template('src/main/java/package/web/rest/dto/_EntityDTO.java',
                'src/main/java/' + this.packageFolder + '/web/rest/dto/' + this.entityClass + 'DTO.java', this, {});

                this.template('src/main/java/package/web/rest/mapper/_EntityMapper.java',
                'src/main/java/' + this.packageFolder + '/web/rest/mapper/' + this.entityClass + 'Mapper.java', this, {});
            }
        },

        writeDbFiles: function() {
            if (this.databaseType == "sql") {
                this.template(RESOURCE_DIR + '/config/liquibase/changelog/_added_entity.xml',
                    RESOURCE_DIR + 'config/liquibase/changelog/' + this.changelogDate + '_added_entity_' + this.entityClass + '.xml', this, { 'interpolate': INTERPOLATE_REGEX });

                this.addChangelogToLiquibase(this.changelogDate + '_added_entity_' + this.entityClass);
            }
            if (this.databaseType == "cassandra") {
                this.template(RESOURCE_DIR + '/config/cql/_added_entity.cql',
                RESOURCE_DIR + 'config/cql/' + this.changelogDate + '_added_entity_' + this.entityClass + '.cql', this, {});
            }
        },

        writeClientFiles: function() {
            if(this.skipClient){
                return;
            }
            this.copyHtml(ANGULAR_DIR + 'entities/_entities.html', ANGULAR_DIR + 'entities/' + this.entityInstance + '-management/' + this.entityInstance + '-management.html', this, {}, true);
            this.copyHtml(ANGULAR_DIR + 'entities/_entity-detail.html', ANGULAR_DIR + 'entities/' + this.entityInstance + '-management/' + this.entityInstance + '-management-detail.html', this, {}, true);
            this.copyHtml(ANGULAR_DIR + 'entities/_entity-dialog.html', ANGULAR_DIR + 'entities/' + this.entityInstance + '-management/' + this.entityInstance + '-management-dialog.html', this, {}, true);
            this.copyHtml(ANGULAR_DIR + 'entities/_entity-delete-dialog.html', ANGULAR_DIR + 'entities/' + this.entityInstance + '-management/' + this.entityInstance + '-management-delete-dialog.html', this, {}, true);

            this.addEntityToMenu(this.entityInstance + '-management', this.enableTranslation);

            this.template(ANGULAR_DIR + 'entities/_entity.js', ANGULAR_DIR + 'entities/' + this.entityInstance + '-management/' + this.entityInstance + '-management.js', this, {});
            this.addJavaScriptToIndex('entities/' + this.entityInstance + '-management/' + this.entityInstance + '-management.js');
            this.template(ANGULAR_DIR + 'entities/_entity-controller.js', ANGULAR_DIR + 'entities/' + this.entityInstance + '-management/' + this.entityInstance + '-management.controller' + '.js', this, {});
            this.addJavaScriptToIndex('entities/' + this.entityInstance + '-management/' + this.entityInstance + '-management.controller' + '.js');
            this.template(ANGULAR_DIR + 'entities/_entity-dialog-controller.js', ANGULAR_DIR + 'entities/' + this.entityInstance + '-management/' + this.entityInstance + '-management-dialog.controller' + '.js', this, {});
            this.addJavaScriptToIndex('entities/' + this.entityInstance + '-management/' + this.entityInstance + '-management-dialog.controller' + '.js');
            this.template(ANGULAR_DIR + 'entities/_entity-delete-dialog-controller.js', ANGULAR_DIR + 'entities/' + this.entityInstance + '-management/' + this.entityInstance + '-management-delete-dialog.controller' + '.js', this, {});
            this.addJavaScriptToIndex('entities/' + this.entityInstance + '-management/' + this.entityInstance + '-management-delete-dialog.controller' + '.js');

            this.template(ANGULAR_DIR + 'entities/_entity-detail-controller.js', ANGULAR_DIR + 'entities/' + this.entityInstance + '-management/' + this.entityInstance + '-management-detail.controller' + '.js', this, {});

            this.addJavaScriptToIndex('entities/' + this.entityInstance + '-management/' + this.entityInstance + '-management-detail.controller' + '.js');

            this.template(ANGULAR_DIR + 'services/_entity-service.js', ANGULAR_DIR + 'entities/' + this.entityInstance + '-management/' + this.entityInstance + '.service' + '.js', this, {});
            this.addJavaScriptToIndex('entities/' + this.entityInstance + '-management/' + this.entityInstance + '.service' + '.js');

            if (this.searchEngine == 'elasticsearch') {
                this.template(ANGULAR_DIR + 'services/_entity-search-service.js', ANGULAR_DIR + 'entities/' + this.entityInstance + '-management/' + this.entityInstance + '.search.service' + '.js', this, {});
                this.addJavaScriptToIndex('entities/' + this.entityInstance + '-management/' + this.entityInstance + '.search.service' + '.js');
            }

            // Copy for each
            if (this.enableTranslation) {
                this.getAllInstalledLanguages().forEach(function(language) {
                    this.copyI18n(language);
                }, this);
            }
        },

        writeClientTestFiles: function () {
            if(this.skipClient){
                return;
            }
            this.template('src/test/javascript/spec/app/_entity-detail-controller.spec.js',
                'src/test/javascript/spec/app/entities/' + this.entityInstance + '-management/' + this.entityInstance + '-management-detail.controller.spec.js', this, {});
        },

        writeTestFiles: function() {
            this.template('src/test/java/package/web/rest/_EntityResourceIntTest.java',
                'src/test/java/' + this.packageFolder + '/web/rest/' + this.entityClass + 'ResourceIntTest.java', this, {});

            if (this.testFrameworks.indexOf('gatling') != -1) {
                this.template('src/test/gatling/simulations/_EntityGatlingTest.scala',
                    'src/test/gatling/simulations/' + this.entityClass + 'GatlingTest.scala', this, {'interpolate': INTERPOLATE_REGEX });
            }

        }
    },

    end: {
        afterRunHook: function() {
            try {
                var modules = this.getModuleHooks();
                if (modules.length > 0) {
                    this.log('\n' + chalk.bold.green('Running post run module hooks\n'));
                    // form the data to be passed to modules
                    var entityConfig = {
                        jhipsterConfigDirectory: this.jhipsterConfigDirectory,
                        filename: this.filename,
                        data: this.data || this.fileData,
                        useConfigurationFile: this.useConfigurationFile,
                        fieldsContainOwnerManyToMany: this.fieldsContainOwnerManyToMany,
                        fieldsContainNoOwnerOneToOne: this.fieldsContainNoOwnerOneToOne,
                        fieldsContainOwnerOneToOne: this.fieldsContainOwnerOneToOne,
                        fieldsContainOneToMany: this.fieldsContainOneToMany,
                        fieldsContainZonedDateTime: this.fieldsContainZonedDateTime,
                        fieldsContainLocalDate: this.fieldsContainLocalDate,
                        fieldsContainDate: this.fieldsContainDate,
                        fieldsContainBigDecimal: this.fieldsContainBigDecimal,
                        fieldsContainBlob: this.fieldsContainBlob,
                        pkType: this.pkType,
                        entityClass: this.entityClass,
                        entityTableName: this.entityTableName,
                        entityInstance: this.entityInstance
                    };
                    // run through all post entity creation module hooks
                    modules.forEach(function(module) {
                        if (module.hookFor == 'entity' && module.hookType == 'post') {
                            // compose with the modules callback generator
                            try {
                                this.composeWith(module.generatorCallback, {
                                    options: {
                                        entityConfig: entityConfig
                                    }
                                });
                            } catch (err) {
                                this.log(chalk.red('Could not compose module ') + chalk.bold.yellow(module.npmPackageName) +
                                chalk.red('. \nMake sure you have installed the module with ') + chalk.bold.yellow('\'npm -g ' + module.npmPackageName + '\''));
                            }
                        }
                    }, this);
                }
            } catch (err) {
                this.log('\n' + chalk.bold.red('Running post run module hooks failed. No modification done to the generated entity.'));
            }
        }
    }
});
