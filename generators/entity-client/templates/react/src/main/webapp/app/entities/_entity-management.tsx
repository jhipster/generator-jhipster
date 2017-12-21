<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

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
import { Button } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FaPlus, FaEye, FaPencil, FaTrash } from 'react-icons/lib/fa';

import { ICrudGetAction } from '../../shared/model/redux-action.type';
import { getEntities } from './<%= entityFileName %>.reducer';

export interface I<%= entityReactName %>Props {
  getEntities: ICrudGetAction;
  <%=entityInstancePlural %>: any[];
  match: any;
}

export class <%= entityReactName %> extends React.Component<I<%= entityReactName %>Props, undefined> {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.getEntities();
  }

  render() {
    const { <%=entityInstancePlural %>, match } = this.props;
    return (
      <%_ const keyPrefix = angularAppName + '.'+ entityTranslationKey + '.'; _%>
      <div>
        <h2>
          <Translate contentKey="<%= keyPrefix %>home.title"><%= entityClassPluralHumanized %></Translate>
          <Link to={`${match.url}/new`} className="btn btn-primary float-right jh-create-entity">
            <FaPlus /> <Translate contentKey="<%= keyPrefix %>home.createLabel" />
          </Link>
        </h2>
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th><Translate contentKey="global.field.id">ID</Translate></th>
                <%_ for (idx in fields) { _%>
                <th<% if (pagination !== 'no') { %> <% } %>><Translate contentKey="<%=keyPrefix + fields[idx].fieldName %>"><%= fields[idx].fieldNameHumanized %></Translate><% if (pagination !== 'no') { %> <span className="fa fa-sort"></span><% } %></th>
                <%_ } _%>
                <%_ for (idx in relationships) { _%>
                    <%_ if (relationships[idx].relationshipType === 'many-to-one'
                    || (relationships[idx].relationshipType === 'one-to-one' && relationships[idx].ownerSide === true)
                    || (relationships[idx].relationshipType === 'many-to-many' && relationships[idx].ownerSide === true && pagination === 'no')) {
                    const fieldName = dto === 'no' ? "." + relationships[idx].otherEntityField : relationships[idx].otherEntityFieldCapitalized;_%>
                <th<% if (pagination !== 'no') { %> <% } %>><Translate contentKey="<%= keyPrefix + relationships[idx].relationshipName%>"><%= relationships[idx].relationshipNameHumanized %></Translate><% if (pagination !== 'no') { %> <span className="fa fa-sort"></span><% } %></th>
                    <%_ } _%>
                <%_ } _%>
                <th />
              </tr>
            </thead>
            <tbody>
              {
                <%=entityInstancePlural %>.map((<%=entityInstance %>, i) => (
                <tr key={`entity-${i}`}>
                  <td>
                    <Button tag={Link} to={`${match.url}/${<%=entityInstance %>.id}`} color="link" size="sm">
                      {<%=entityInstance %>.id}
                    </Button>
                  </td>
                  <%_ for (idx in fields) { _%>
                    <td>
                      {<%=entityInstance%>.<%=fields[idx].fieldName%>}
                    </td>
                  <%_ } _%>
                  <td className="text-right">
                    <div className="btn-group flex-btn-group-container">
                      <Button tag={Link} to={`${match.url}/${<%=entityInstance %>.id}`} color="info" size="sm">
                        <FaEye/> <span className="d-none d-md-inline" ><Translate contentKey="entity.action.view" /></span>
                      </Button>
                      <Button tag={Link} to={`${match.url}/${<%=entityInstance %>.id}/edit`} color="primary" size="sm">
                        <FaPencil/> <span className="d-none d-md-inline"><Translate contentKey="entity.action.edit" /></span>
                      </Button>
                      <Button tag={Link} to={`${match.url}/${<%=entityInstance %>.id}/delete`} color="danger" size="sm">
                        <FaTrash/> <span className="d-none d-md-inline"><Translate contentKey="entity.action.delete" /></span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            }
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

const mapStateToProps = storeState => ({
  <%=entityInstancePlural %>: storeState.<%= entityInstance %>.entities
});

const mapDispatchToProps = { getEntities };

export default connect(mapStateToProps, mapDispatchToProps)(<%= entityReactName %>);
