<%#
 Copyright 2013-2018 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see http://www.jhipster.tech/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button<% if (haveFieldWithJavadoc) { %>, UncontrolledTooltip<% } %> } from 'reactstrap';
// TODO import TextFormat only when fieldContainsDate
// tslint:disable-next-line:no-unused-variable
import { Translate, ICrudGetAction, TextFormat } from 'react-jhipster';
import { FaArrowLeft } from 'react-icons/lib/fa';

import { getEntity } from './<%= entityFileName %>.reducer';
// tslint:disable-next-line:no-unused-variable
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from '../../config/constants';

export interface I<%= entityReactName %>DetailProps {
  getEntity: ICrudGetAction;
  <%= entityInstance %>: any;
  match: any;
}

export class <%= entityReactName %>Detail extends React.Component<I<%= entityReactName %>DetailProps> {

  componentDidMount() {
    this.props.getEntity(this.props.match.params.id);
  }

  render() {
    const { <%= entityInstance %> } = this.props;
    return (
      <%_ const keyPrefix = angularAppName + '.'+ entityTranslationKey + '.'; _%>
      <div>
        <h2>
          <Translate contentKey="<%= keyPrefix %>detail.title"><%= entityClass %></Translate> [<b>{<%= entityInstance %>.id}</b>]
        </h2>
        <dl className="row-md jh-entity-details">
        <%_ for (idx in fields) {
            const fieldType = fields[idx].fieldType;
        _%>
          <dt>
            <span id="<%= fields[idx].fieldName %>">
              <Translate contentKey="<%= keyPrefix %><%= fields[idx].fieldName %>">
              <%=fields[idx].fieldName%>
              </Translate>
            </span>
            <%_ if (fields[idx].javadoc) { _%>
            <UncontrolledTooltip target="<%= fields[idx].fieldName %>">
              <%_ if (enableTranslation) { _%>
              <Translate contentKey="<%= keyPrefix %>help.<%= fields[idx].fieldName %>"/>
              <%_ } else { _%>
              <%= fields[idx].javadoc %>
              <%_ } _%>
            </UncontrolledTooltip>
            <%_ } _%>
          </dt>
          <dd>
          <%_ if (fieldType === 'Boolean') { _%>
            {<%= entityInstance %>.<%=fields[idx].fieldName%> ? 'true' : 'false'}
          <%_ } else if (fieldType === 'Instant' || fieldType === 'ZonedDateTime') { _%>
            <TextFormat value={<%= entityInstance %>.<%=fields[idx].fieldName%>} type="date" format={APP_DATE_FORMAT} />
          <%_ } else if (fieldType === 'LocalDate') { _%>
            <TextFormat value={<%= entityInstance %>.<%=fields[idx].fieldName%>} type="date" format={APP_LOCAL_DATE_FORMAT} />
          <%_ } else { _%>
            {<%= entityInstance %>.<%= fields[idx].fieldName %>}
          <%_ } _%>
          </dd>
          <%_ } _%>
          <%_ for (idx in relationships) {
              const relationshipType = relationships[idx].relationshipType;
              const ownerSide = relationships[idx].ownerSide;
              const relationshipName = relationships[idx].relationshipName;
              const relationshipFieldName = relationships[idx].relationshipFieldName;
              const relationshipFieldNamePlural = relationships[idx].relationshipFieldNamePlural;
              const relationshipNameHumanized = relationships[idx].relationshipNameHumanized;
              const otherEntityName = relationships[idx].otherEntityName;
              const otherEntityStateName = relationships[idx].otherEntityStateName;
              const otherEntityField = relationships[idx].otherEntityField;
              const otherEntityFieldCapitalized = relationships[idx].otherEntityFieldCapitalized;
              if (relationshipType === 'many-to-one'
              || (relationshipType === 'one-to-one' && ownerSide === true)
              || (relationshipType === 'many-to-many' && ownerSide === true)) { _%>
          <dt>
            <Translate contentKey="<%= keyPrefix %><%= relationshipName %>">
              <%= relationshipNameHumanized %>
            </Translate>
          </dt>
          <dd>
              <%_ if (otherEntityName === 'user') { _%>
                  <%_ if (relationshipType === 'many-to-many') { _%>
  {
    (<%= entityInstance %>.<%= relationshipFieldNamePlural %>) ?
        (<%= entityInstance %>.<%= relationshipFieldNamePlural %>.map((val, i) =>
            <span key={val.id}><a>{val.<%= otherEntityField %>}</a>{(i === <%= entityInstance %>.<%= relationshipFieldNamePlural %>.length - 1) ? '' : ', '}</span>
        )
    ) : null
  }                  <%_ } else { _%>
                      <%_ if (dto === 'no') { _%>
              {(<%= entityInstance + "." + relationshipFieldName %>) ? <%= entityInstance + "." + relationshipFieldName + "." + otherEntityField %> : ''}
                          <%_ } else { _%>
              {<%= entityInstance + "." + relationshipFieldName + otherEntityFieldCapitalized %> ? <%= entityInstance + "." + relationshipFieldName + otherEntityFieldCapitalized %> : ''}
                      <%_ } _%>
                  <%_ } _%>
              <%_ } else { _%>
                  <%_ if (relationshipType === 'many-to-many') { _%>
  {
      (<%= entityInstance %>.<%= relationshipFieldNamePlural %>) ?
          (<%= entityInstance %>.<%= relationshipFieldNamePlural %>.map((val, i) =>
              <span key={val.id}><a>{val.<%= otherEntityField %>}</a>{(i === <%= entityInstance %>.<%= relationshipFieldNamePlural %>.length - 1) ? '' : ', '}</span>
          )
      ) : null
  }
                  <%_ } else { _%>
                      <%_ if (dto === 'no') { _%>
              {(<%= entityInstance + "." + relationshipFieldName %>) ? <%= entityInstance + "." + relationshipFieldName + "." + otherEntityField %> : ''}
                      <%_ } else { _%>
              {<%= entityInstance + "." + relationshipFieldName + otherEntityFieldCapitalized %> ? <%= entityInstance + "." + relationshipFieldName + otherEntityFieldCapitalized %> : ''}
                      <%_ } _%>
                  <%_ } _%>
              <%_ } _%>
          </dd>
          <%_ } _%>
        <%_ } _%>
        </dl>
        <Button tag={Link} to="/<%= entityFileName %>" replace color="info">
          <FaArrowLeft/> <span className="d-none d-md-inline" ><Translate contentKey="entity.action.back">Back</Translate></span>
        </Button>
      </div>
    );
  }
}

const mapStateToProps = storeState => ({
    <%= entityInstance %>: storeState.<%= entityInstance %>.entity
});

const mapDispatchToProps = { getEntity };

export default connect(mapStateToProps, mapDispatchToProps)(<%= entityReactName %>Detail);
