# Latest: v3.6.12
_Released on: 2019-03-03_

## What's new
  - Made selecting DTOs without services not throw an error (thanks @ruddell)
  - Supported relations when an application uses Couchbase as DB (thanks @tchlyah)
  - Sonar reports are configured (thanks @jdubois)

## Bug fixes
  - An application's baseName can now have an underscore in the JDL (thanks @Shaolans)

As a side note, the linter has been added, but will only be available in v3.7.0.

---

# v3.6.11
_Released on: 2019-02-14_

## What's new
  - Nothing

## Bug fixes
  - Fixed invalid `otherEntityRelationshipName` generated for the destination entity of a relationship (thanks @pvliss)

---

# v3.6.10
_Released on: 2019-02-09_

## What's new
  - Merged the `lint` branch into `master`, but didn't make it available yet

## Bug fixes
  - Fixed regression with generation of `otherEntityRelationshipName` (thanks @pvliss)

---

# v3.6.9
_Released on: 2019-01-29_

## What's new
  - Nothing

## Bug fixes
  - Allowed relationships from the User entity if `skipUserManagement` is set (thanks @murdos)
  - Always set the `otherEntityRelationshipName` to the appropriate value (thanks @pvliss)

---

# v3.6.8
_Released on: 2019-01-25_

## What's new
  - Warned rather than throw an exception when a reserved word is used as field name (thanks @murdos)
  - Added the `jpaDerivedIdentifier` option to relationships

## Bug fixes
  - Fixed issue with `unique` validation for `LocalDate`

---

# v3.6.7
_Released on: 2018-11-12_

## What's new
  - Nothing

## Bug fixes
  - Fixed the exporting of a JDL Deployment (didn't display the `deployment` keyword before)

---

# v3.6.6
_Released on: 2018-11-11_

## What's new
  - Set defaults for `devDBType` and `prodDBType`

## Bug fixes
  - Fixed validation for `ingressdomain` (thanks @deepu105)

---

# v3.6.5
_Released on: 2018-11-11_

## What's new
  - `devDatabaseType` & `prodDatabaseType` can now be set to default values depending on the `databaseType` prop

## Bug fixes
  - The `serviceDiscoveryType` negative default value is now `false`

---

# v3.6.4
_Released on: 2018-11-11_

## What's new
  - Nothing

## Bug fixes
  - Prevent duplicate entities from being exported (thanks @deepu105)

---

# v3.6.3
_Released on: 2018-11-11_

## What's new
  - Nothing

## Bug fixes
  - Fixed exported deployments when importing a JDL file, now exports an empty list if there's no deployment to export (thanks @deepu105)

---

# v3.6.2
_Released on: 2018-11-11_

## What's new
  - Nothing

## Bug fixes
  - Fixed what the JDL importer returns when there is no deployment (now returns an empty list for deployments if there's nothing) (thanks @deepu105)

---

# v3.6.1
_Released on: 2018-11-06_

## What's new
  - More DB validations are included (combinations, forbidden values)
  - Specifying a blueprint is now possible

## Bug fixes
  - Issue [#8760](https://github.com/jhipster/generator-jhipster/issues/8760) from the generator should be fixed, thanks to @pascalgrimaud 

---

# v3.6.0
_Released on: 2018-11-06_

## What's new
  - The brand new `deployment` syntax has been added to the JDL by @deepu105!

## Bug fixes
  - Nothing

---

# v3.5.0
_Released on: 2018-11-03_

## What's new
  - Application options are now validated
  - Options `dtoSuffix` & `entitySuffix` have been added (thanks to @mselerin!)
  - Just using `angular` as clientFramework fallbacks to using `angularX` (thanks to @jdubois for reporting it!)

## Bug fixes
  - JDL exporting now doesn't fail when there is no relationship (thanks to @pascalgrimaud!)
  - `skipUserManagement` isn't forced in UAA & gateway apps anymore (thanks to @jsm174!)
  - Package names can now have underscores (thanks to @jsm174!)
  - Importing a JDL file where entities are generated in different apps will cause the process to fail.

---

# v3.4.0
_Released on: 2018-10-07_

## What's new
  - **This project now uses NPM and not yarn**
  - Added the `unique` constraint
  - Used terser as minificator & uglifier (previously uglifly-webpack-plugin)

## Bug fixes
  - Quotes are now escaped properly in regex validations
  - JWT and rememberMe keys are no longer set in the project (done in the generator)
  - If an app is already generated, it keeps its values and only replaces the changed values
  - 0 doesn't make the JDL constraint fail any longer
  - Various fixes for JDL app generation:
    - Made eureka the default choice for MS & GW apps 
    - Made eureka the default choice for uaa apps 
    - uaa apps now have false skipUserManagement
  - The project's installation on windows works now

---

# v3.3.3
_Released on: 2018-09-15_

## What's new
  - Added support for MongoDB relationships (thanks to @ivangsa)

## Bug fixes
  - Fixed language regex (thanks to @ttoommbb)

---

# v3.3.2
_Released on: 2018-09-15_

## What's new
  - Nothing
  
## Bug fixes
  - The `rememberMe` and JWT keys are updated to match the generator's: they're not set anymore, the generator does that for us

---

# v3.3.1
_Released on: 2018-09-02_

## What new:
  - NPM is now the new default  for `clientPackageManager` (previously, yarn)

## Bug fixes:
  - Fixed DTO & service configuration in the JDL (#251), thanks @ruddell for finding it and filling an issue!

---

# v3.3.0
_Released on: 2018-09-02_

## What's new
  - Added package-lock.json file

## Bug fixes
  - Nothing

---

# v3.2.0
_Released on: 2018-09-02_

## What's new
  - Clarified error messages
  - The JDLRelationship object now accepts strings for entity names (from & to)
  - Now sets a default clientRootFolder value when in a microservice app (#252)
  - (a basic) Prettier support has been added to the project

## Deprecated
  -  AbstractJDLOption methods
    - #addEntity & #ecludeEntity will be replaced by: #addEntityName & #excludeEntityName
  - The JDLRelationship will only accept string for entity names (from & to)

---

# v3.1.0
_Released on: 2018-07-17_

## What's new
  - The migration to [chevrotain](https://github.com/sap/chevrotain) is finally over! Which gets us more control over the parsing system (and more tests, coverage, speed when developing features)
  - Annotations for options are implemented:
```
@dto(mapstruct)
@service(serviceClass)
entity A
```
  - The `jhipsterVersion` property for applications is deprecated and will be removed in the next major release
  - When exporting entities to JDL, the table name is now only exported as long as it's not the same as the entity name
  - 242, required relationships from/to the same entity are forbidden
  - 243, constrained the use of `no` as database type (from the generator)
  - 244, `TextBlob` only have `required` as constraint (from the generator)
  - API:
    - The JDLObject now has loop methods over entities, applications etc. 

**Huge thanks to @bd82 for his tremendous help proposing the migration and getting it done!**

## Bug fixes
  - 239, Fixed error message and type check per application
  - When declaring arrays in the JDL (for languages, testFrameworks, etc.), braces didn't really work, this is fixed, the two possible syntaxes are `languages []` or `languages [fr, en]`. **braces are mandatory**
  - Creating directories failed on windows
  - Added the entities for each exported JDL application
  - @ruddell fixed the relationships when not selecting injected fields

---

# v3.0.2
_Released on: 2018-06-13_

## What's new
  - Injected fields are now optional, so having this: `relationship XYZ { A to B }` is possible from now on.
  - App options in the JDL `testFrameworks`, `langauges` don't require braces around anymore (optional)

## Bug fixes
  - `oauth2` is now available as an `authenticationType` option for the app generation

---

# v3.0.1
_Released on: 2018-06-11_

## What's new
  - Nothing

## Bug fixes
  - `searchEngine` is now set to `false` when excluding from the JDL (thanks to @Tcharl for this!)

---

# v3.0.0
_Released on: 2018-05-31_

## Breaking changes
  - `JDLObject#hasOption` has been removed (not used in the project)
  - `JDLReader::parse` has been removed (in favor of `::parseFromConfigurationObject`
  - The entity and application exporters now return relevant informations:
    - Application exporter: the exported application list
    - Entity exporter: the exported entity list
  - Set is no longer exposed (future removal will happen, maybe)

## What's new
  - The class JDLImporter has been developed so as not to use the other ones (DocumentParser, JHipsterEntityExporter, etc.) directly. It has been created to be used in the import-jdl subgen, without having to use other classes.
  - MySQL 8 reserved keywords are in
  - The business checks are now done in a special class (BusinessErrorChecker) instead of doing them just after the JDL is parsed

## Bug fixes
  - Fixed #60
  - Application generation has been fixed
  - Fixed the `skipUserManagement` option
  - The `databaseType` is no longer needed in the DocumentParser (caused an issue when parsing applications)
  - Having DTOs without services is now forbidden
  - Using `no` as database type now works
  - Different jpaMetamodelFiltering values are now detected when checking for entity equality

As a side note, there are no longer react reserved keywords.
