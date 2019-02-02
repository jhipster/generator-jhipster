/** Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const _ = require('lodash');
const JDLParser = require('./jdl_parser');

module.exports = {
  buildAst
};

const parser = JDLParser.getParser();
parser.parse();

const BaseJDLCSTVisitor = parser.getBaseCstVisitorConstructor();

class JDLAstBuilderVisitor extends BaseJDLCSTVisitor {
  constructor() {
    super();
    this.validateVisitor();
  }

  prog(context) {
    const ast = {
      applications: [],
      deployments: [],
      constants: {},
      entities: [],
      relationships: [],
      enums: [],
      dto: {},
      pagination: {},
      service: {},
      microservice: {},
      searchEngine: {},
      noClient: { list: [], excluded: [] },
      noServer: { list: [], excluded: [] },
      filter: { list: [], excluded: [] },
      angularSuffix: {},
      noFluentMethod: { list: [], excluded: [] },
      clientRootFolder: {}
    };

    if (context.constantDeclaration) {
      const constants = context.constantDeclaration.map(this.visit, this);
      constants.forEach(currConst => {
        ast.constants[currConst.name] = currConst.value;
      });
    }

    if (context.applicationDeclaration) {
      ast.applications = context.applicationDeclaration.map(this.visit, this);
    }

    if (context.deploymentDeclaration) {
      ast.deployments = context.deploymentDeclaration.map(this.visit, this);
    }

    if (context.entityDeclaration) {
      ast.entities = context.entityDeclaration.map(this.visit, this);
    }

    if (context.relationDeclaration) {
      ast.relationships = _.flatMap(context.relationDeclaration, item => this.visit(item));
    }

    if (context.enumDeclaration) {
      ast.enums = context.enumDeclaration.map(this.visit, this);
    }

    const optionContextToAstMapping = {
      dtoDeclaration: 'dto',
      paginationDeclaration: 'pagination',
      serviceDeclaration: 'service',
      microserviceDeclaration: 'microservice',
      searchEngineDeclaration: 'searchEngine',
      angularSuffixDeclaration: 'angularSuffix',
      noFluentMethod: 'noFluentMethod',
      filterDeclaration: 'filter',
      clientRootFolderDeclaration: 'clientRootFolder',
      noClientDeclaration: 'noClient',
      noServerDeclaration: 'noServer',
      filter: 'filter'
    };

    Object.keys(optionContextToAstMapping).forEach(contextName => {
      const astName = optionContextToAstMapping[contextName];
      if (!context[contextName]) {
        return;
      }
      context[contextName].map(this.visit, this).forEach(astNewItem => {
        let astResult;
        if (astNewItem.name) {
          if (!ast[astName][astNewItem.name]) {
            astResult = { list: astNewItem.list, excluded: [] };
            ast[astName][astNewItem.name] = astResult;
          } else {
            astResult = ast[astName][astNewItem.name];
          }
        } else {
          astResult = ast[astName];
        }

        // TODO: for the linter, check dupes
        astResult.list = _.uniq(astResult.list.concat(astNewItem.list));

        if (astNewItem.excluded) {
          astResult.excluded = _.uniq(astResult.excluded.concat(astNewItem.excluded));
        }
      });
    });

    return ast;
  }

  constantDeclaration(context) {
    return {
      name: context.NAME[0].image,
      value: parseInt(context.INTEGER[0].image, 10)
    };
  }

  entityDeclaration(context) {
    const annotations = [];
    if (context.simpleAnnotationDeclaration) {
      context.simpleAnnotationDeclaration.forEach(contextObject => {
        annotations.push(this.visit(contextObject));
      });
    }
    if (context.complexAnnotationDeclaration) {
      context.complexAnnotationDeclaration.forEach(contextObject => {
        annotations.push(this.visit(contextObject));
      });
    }

    let javadoc = null;
    if (context.JAVADOC) {
      javadoc = trimComment(context.JAVADOC[0].image);
    }

    const name = context.NAME[0].image;

    let tableName = name;
    if (context.entityTableNameDeclaration) {
      tableName = this.visit(context.entityTableNameDeclaration);
    }

    let body = [];
    if (context.entityBody) {
      body = this.visit(context.entityBody);
    }

    return {
      annotations,
      name,
      tableName,
      body,
      javadoc
    };
  }

  simpleAnnotationDeclaration(context) {
    return { option: context.option[0].image, type: 'UNARY' };
  }

  complexAnnotationDeclaration(context) {
    return { option: context.option[0].image, method: context.value[0].image, type: 'BINARY' };
  }

  entityTableNameDeclaration(context) {
    return context.NAME[0].image;
  }

  entityBody(context) {
    if (!context.fieldDeclaration) {
      return [];
    }
    return context.fieldDeclaration.map(element => this.visit(element));
  }

  fieldDeclaration(context) {
    // filter actual comment as the comment rule may be empty
    const comment = context.JAVADOC ? trimComment(context.JAVADOC[0].image) : null;

    let validations = [];
    if (context.validation) {
      validations = context.validation.map(element => this.visit(element));
    }

    return {
      name: context.NAME[0].image,
      // context.type is an array with a single item.
      // in that case:
      // this.visit(context.type) is equivalent to this.visit(context.type[0])
      type: this.visit(context.type),
      validations,
      javadoc: comment
    };
  }

  type(context) {
    return context.NAME[0].image;
  }

  validation(context) {
    // only one of these alternatives can exist at the same time.
    if (context.REQUIRED) {
      return {
        key: 'required',
        value: ''
      };
    }
    if (context.UNIQUE) {
      return {
        key: 'unique',
        value: ''
      };
    }
    if (context.minMaxValidation) {
      return this.visit(context.minMaxValidation);
    }
    return this.visit(context.pattern);
  }

  minMaxValidation(context) {
    const isIdentifier = !!context.NAME;
    const validationAst = {
      key: context.MIN_MAX_KEYWORD[0].image,
      value: isIdentifier ? context.NAME[0].image : parseInt(context.INTEGER[0].image, 10)
    };

    if (isIdentifier) {
      validationAst.constant = true;
    }
    return validationAst;
  }

  pattern(context) {
    const patternImage = context.REGEX[0].image;

    return {
      key: 'pattern',
      value: patternImage.substring(1, patternImage.length - 1)
    };
  }

  relationDeclaration(context) {
    const cardinality = this.visit(context.relationshipType);
    const relationshipBodies = context.relationshipBody.map(this.visit, this);

    relationshipBodies.forEach(relationshipBody => {
      relationshipBody.cardinality = cardinality;
    });

    return relationshipBodies;
  }

  relationshipType(context) {
    if (context.ONE_TO_ONE) {
      return 'one-to-one';
    }
    if (context.ONE_TO_MANY) {
      return 'one-to-many';
    }
    if (context.MANY_TO_ONE) {
      return 'many-to-one';
    }
    if (context.MANY_TO_MANY) {
      return 'many-to-many';
    }

    /* istanbul ignore next */
    throw new Error('No valid relationship type found, expected a OneToOne, a OneToMany, a ManyToOne or a ManyToMany.');
  }

  relationshipBody(context) {
    const from = this.visit(context.from);
    const to = this.visit(context.to);

    let relationshipOptions = {};

    if (context.relationshipOptions) {
      relationshipOptions = this.visit(context.relationshipOptions);
    }

    return { from, to, ...relationshipOptions };
  }

  relationshipSide(context) {
    const javadoc = this.visit(context.comment);
    const name = context.NAME[0].image;

    const required = !!context.REQUIRED;
    let injectedField = null;

    if (context.injectedField) {
      injectedField = context.injectedField[0].image;

      if (context.injectedFieldParam) {
        injectedField += `(${context.injectedFieldParam[0].image})`;
      }
    }

    const ast = {
      name,
      injectedField,
      javadoc,
      required
    };

    if (!injectedField) {
      delete ast.required;
    }
    return ast;
  }

  relationshipOptions(context) {
    return context.relationshipOption.map(this.visit, this).reduce(
      (final, current) => ({
        ...final,
        ...current
      }),
      {}
    );
  }

  relationshipOption(context) {
    if (context.JPA_DERIVED_IDENTIFIER) {
      return { useJPADerivedIdentifier: true };
    }

    /* istanbul ignore next */
    throw new Error("No valid relationship option found, expected 'jpaDerivedIdentifier'.");
  }

  enumDeclaration(context) {
    const name = context.NAME[0].image;
    const values = this.visit(context.enumPropList);

    return { name, values };
  }

  enumPropList(context) {
    return context.NAME.map(prop => prop.image);
  }

  dtoDeclaration(context) {
    return extractNameListExcluded(context, this);
  }

  entityList(context) {
    let entityList = [];
    if (context.NAME) {
      entityList = context.NAME.map(nameToken => nameToken.image);
    }

    if (context.ALL || context.STAR) {
      entityList.push('*');
    }

    entityList.push(context.method[0].image);

    // TODO: for the linter, check dupes
    return _.uniq(entityList);
  }

  exclusion(context) {
    return context.NAME.map(nameToken => nameToken.image, this);
  }

  paginationDeclaration(context) {
    return extractNameListExcluded(context, this);
  }

  serviceDeclaration(context) {
    return extractNameListExcluded(context, this);
  }

  microserviceDeclaration(context) {
    return extractNameListExcluded(context, this);
  }

  searchEngineDeclaration(context) {
    return extractNameListExcluded(context, this);
  }

  noClientDeclaration(context) {
    return extractListExcluded(context, this);
  }

  noServerDeclaration(context) {
    return extractListExcluded(context, this);
  }

  noFluentMethod(context) {
    return extractListExcluded(context, this);
  }

  filterDeclaration(context) {
    return extractListExcluded(context, this);
  }

  filterDef(context) {
    let entityList = [];
    if (context.NAME) {
      entityList = context.NAME.map(nameToken => nameToken.image, this);
    }

    if (context.ALL || context.STAR) {
      entityList.push('*');
    }

    // TODO: for the linter, check dupes
    return _.uniq(entityList);
  }

  clientRootFolderDeclaration(context) {
    return extractNameListExcluded(context, this);
  }

  angularSuffixDeclaration(context) {
    return extractNameListExcluded(context, this);
  }

  comment(context) {
    if (context.JAVADOC) {
      return trimComment(context.JAVADOC[0].image);
    }

    return null;
  }

  deploymentDeclaration(context) {
    const config = {};

    if (context.deploymentConfigDeclaration) {
      const configProps = context.deploymentConfigDeclaration.map(this.visit, this);
      configProps.forEach(configProp => {
        config[configProp.key] = configProp.value;
      });
    }

    return config;
  }

  deploymentConfigDeclaration(context) {
    const key = context.DEPLOYMENT_KEY[0].image;
    const value = this.visit(context.deploymentConfigValue);

    return { key, value };
  }

  deploymentConfigValue(context) {
    return this.configValue(context);
  }

  applicationDeclaration(context) {
    return this.visit(context.applicationSubDeclaration);
  }

  applicationSubDeclaration(context) {
    const applicationSubDeclaration = {
      config: {},
      entities: { entityList: [], excluded: [] }
    };

    if (context.applicationSubConfig) {
      // Apparently the pegjs grammar only returned the last config
      applicationSubDeclaration.config = this.visit(
        context.applicationSubConfig[context.applicationSubConfig.length - 1]
      );
    }

    if (context.applicationSubEntities) {
      // Apparently the pegjs grammar only returned the last entities
      applicationSubDeclaration.entities = this.visit(
        context.applicationSubEntities[context.applicationSubEntities.length - 1]
      );
    }

    return applicationSubDeclaration;
  }

  applicationSubConfig(context) {
    const config = {};

    if (context.applicationConfigDeclaration) {
      const configProps = context.applicationConfigDeclaration.map(this.visit, this);
      configProps.forEach(configProp => {
        config[configProp.key] = configProp.value;

        if (configProp.key === 'packageName' && !config.packageFolder) {
          config.packageFolder = configProp.value.replace(/[.]/g, '/');
        }
      });
    }

    return config;
  }

  applicationSubEntities(context) {
    const result = extractListExcluded(context, this, 'entityList');
    if (!result.excluded) {
      result.excluded = [];
    }
    return result;
  }

  applicationConfigDeclaration(context) {
    const key = context.CONFIG_KEY[0].image;
    const value = this.visit(context.configValue);

    return { key, value };
  }

  configValue(context) {
    if (context.qualifiedName) {
      return this.visit(context.qualifiedName);
    }
    if (context.list) {
      return this.visit(context.list);
    }
    if (context.INTEGER) {
      return context.INTEGER[0].image;
    }
    if (context.STRING) {
      const stringImage = context.STRING[0].image;
      return stringImage.substring(1, stringImage.length - 1);
    }
    if (context.BOOLEAN) {
      return context.BOOLEAN[0].image === 'true';
    }

    /* istanbul ignore next */
    throw new Error(
      'No valid config value was found, expected a qualified name, a list, an integer, a string or a boolean.'
    );
  }

  qualifiedName(context) {
    return context.NAME.map(namePart => namePart.image, this).join('.');
  }

  list(context) {
    if (!context.NAME) {
      return [];
    }
    return context.NAME.map(namePart => namePart.image, this);
  }
}

function extractNameListExcluded(context, visitor) {
  const entityList = visitor.visit(context.entityList);
  const last = entityList[entityList.length - 1];
  const allButFirst = _.dropRight(entityList);

  let exclusion;
  if (context.exclusion) {
    exclusion = visitor.visit(context.exclusion);
  }

  return { name: last, list: allButFirst, excluded: exclusion };
}

function extractListExcluded(context, visitor, listPropName) {
  if (!listPropName) {
    listPropName = 'list';
  }

  const entityList = visitor.visit(context.filterDef);

  let exclusion;
  if (context.exclusion) {
    exclusion = visitor.visit(context.exclusion);
  }

  const result = { excluded: exclusion };
  result[listPropName] = entityList;
  return result;
}

function trimComment(comment) {
  return comment.replace(/^\/[*]+/, '').replace(/[*]+\/$/, '');
}

const astBuilderVisitor = new JDLAstBuilderVisitor();

function buildAst(cst) {
  return astBuilderVisitor.visit(cst);
}
