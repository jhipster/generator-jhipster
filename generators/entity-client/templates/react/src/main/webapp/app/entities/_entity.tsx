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
import { Button<% if (searchEngine === 'elasticsearch') { %>, InputGroup<% } %> } from 'reactstrap';
<%_ if (searchEngine === 'elasticsearch') { _%>
import { AvForm, AvGroup, AvInput } from 'availity-reactstrap-validation';
<%_ } _%>
// TODO import TextFormat only when fieldContainsDate
// tslint:disable-next-line:no-unused-variable
import { Translate, translate, ICrudGetAction, TextFormat } from 'react-jhipster';
import { FaPlus, FaEye, FaPencil, FaTrash<% if (searchEngine === 'elasticsearch') { %>, FaSearch<% } %> } from 'react-icons/lib/fa';

import {
<%_ for (idx in relationships) { const relationshipFieldNamePlural = relationships[idx].relationshipFieldNamePlural;const otherEntityNamePlural = relationships[idx].otherEntityNamePlural; _%>
  get<%= otherEntityNamePlural %>,
<%_ } _%>
  <%_ if (searchEngine === 'elasticsearch') { _%>
  getSearchEntities,
  <%_ } _%>
  getEntities
} from './<%= entityFileName %>.reducer';
 // tslint:disable-next-line:no-unused-variable
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from '../../config/constants';

export interface I<%= entityReactName %>Props {
  getEntities: ICrudGetAction;
  <%_ if (searchEngine === 'elasticsearch') { _%>
  getSearchEntities: ICrudGetAction;
  <%_ } _%>
  <%=entityInstancePlural %>: any[];
  <%_ for (idx in relationships) {
    const relationshipFieldNamePlural = relationships[idx].relationshipFieldNamePlural;
    const otherEntityNamePlural = relationships[idx].otherEntityNamePlural;
  _%>
  get<%= otherEntityNamePlural %>: ICrudGetAction;
  <%_ } _%>
  match: any;
}
<%_ if (searchEngine === 'elasticsearch') { _%>

export interface I<%= entityReactName %>State {
  search: string;
}
<%_ } _%>

export class <%= entityReactName %> extends React.Component<I<%= entityReactName %>Props<% if (searchEngine === 'elasticsearch') { %>, I<%= entityReactName %>State<% } %>> {
<%_ if (searchEngine === 'elasticsearch') { _%>
  constructor(props) {
    super(props);
    this.state = {
      search: ''
    };
  }

<%_ } _%>
  componentDidMount() {
    this.props.getEntities();
    <%_ for (idx in relationships) {
      const relationshipFieldNamePlural = relationships[idx].relationshipFieldNamePlural;
      const otherEntityNamePlural = relationships[idx].otherEntityNamePlural;
    _%>
    this.props.get<%= otherEntityNamePlural %>();
    <%_ } _%>
  }
  <%_ if (searchEngine === 'elasticsearch') { _%>

  search = () => {
    if (this.state.search) {
      this.props.getSearchEntities(this.state.search);
    }
  }

  clear = () => {
    this.props.getEntities();
    this.setState({
      search: ''
    });
  }

  handleSearch = event => this.setState({ search: event.target.value });
  <%_ } _%>

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
        <%_ if (searchEngine === 'elasticsearch') { _%>
        <div className="row">
          <div className="col-sm-12">
            <AvForm onSubmit={this.search}>
              <AvGroup>
                <InputGroup>
                  <AvInput type="text" name="search" value={this.state.search} onChange={this.handleSearch} placeholder={translate('<%= keyPrefix %>home.search')} />
                  <Button className="input-group-addon">
                    <FaSearch/>
                  </Button>
                  <Button type="reset" className="input-group-addon" onClick={this.clear}>
                    <FaTrash/>
                  </Button>
                </InputGroup>
              </AvGroup>
            </AvForm>
          </div>
        </div>
        <%_ } _%>
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th><Translate contentKey="global.field.id">ID</Translate></th>
                <%_ for (idx in fields) { _%>
                <th<% if (pagination !== 'no') { %> <% } %>><Translate contentKey="<%=keyPrefix + fields[idx].fieldName %>"><%= fields[idx].fieldNameHumanized %></Translate><% if (pagination !== 'no') { %> <span className="fa fa-sort"/><% } %></th>
                <%_ } _%>
                <%_ for (idx in relationships) { _%>
                    <%_ if (relationships[idx].relationshipType === 'many-to-one'
                    || (relationships[idx].relationshipType === 'one-to-one' && relationships[idx].ownerSide === true)
                    || (relationships[idx].relationshipType === 'many-to-many' && relationships[idx].ownerSide === true && pagination === 'no')) {
                    const fieldName = dto === 'no' ? "." + relationships[idx].otherEntityField : relationships[idx].otherEntityFieldCapitalized;_%>
                <th<% if (pagination !== 'no') { %> <% } %>><Translate contentKey="<%= keyPrefix + relationships[idx].relationshipName%>"><%= relationships[idx].relationshipNameHumanized %></Translate><% if (pagination !== 'no') { %> <span className="fa fa-sort"/><% } %></th>
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
                      {<%= entityInstance %>.id}
                    </Button>
                  </td>
                  <%_ for (idx in fields) {
                    const fieldType = fields[idx].fieldType;
                  _%>
                  <td>
                  <%_ if (fieldType === 'Boolean') { _%>
                    {<%= entityInstance %>.<%=fields[idx].fieldName%> ? 'true' : 'false'}
                  <%_ } else if (fieldType === 'Instant' || fieldType === 'ZonedDateTime') { _%>
                    <TextFormat type="date" value={<%= entityInstance %>.<%=fields[idx].fieldName%>} format={APP_DATE_FORMAT} />
                  <%_ } else if (fieldType === 'LocalDate') { _%>
                    <TextFormat type="date" value={<%= entityInstance %>.<%=fields[idx].fieldName%>} format={APP_LOCAL_DATE_FORMAT} />
                  <%_ } else { _%>
                    {<%= entityInstance %>.<%= fields[idx].fieldName %>}
                  <%_ } _%>
                  </td>
                  <%_ } _%>
                  <%_ for (idx in relationships) {
                    const relationshipType = relationships[idx].relationshipType;
                    const ownerSide = relationships[idx].ownerSide;
                    const relationshipFieldName = relationships[idx].relationshipFieldName;
                    const relationshipFieldNamePlural = relationships[idx].relationshipFieldNamePlural;
                    const otherEntityName = relationships[idx].otherEntityName;
                    const otherEntityStateName = relationships[idx].otherEntityStateName;
                    const otherEntityField = relationships[idx].otherEntityField;
                    const otherEntityFieldCapitalized = relationships[idx].otherEntityFieldCapitalized; _%>
                    <%_ if (relationshipType === 'many-to-one'
                    || (relationshipType === 'one-to-one' && ownerSide === true)
                    || (relationshipType === 'many-to-many' && ownerSide === true && pagination === 'no')) { _%>
                  <td>
                    <%_ if (otherEntityName === 'user') { _%>
                      <%_ if (relationshipType === 'many-to-many') { _%>
                    {
                      (<%= entityInstance %>.<%= relationshipFieldNamePlural %>) ?
                          (<%= entityInstance %>.<%= relationshipFieldNamePlural %>.map((val, j) =>
                              <span key={j}>{val.<%= otherEntityField %>}{(j === <%= entityInstance %>.<%= relationshipFieldNamePlural %>.length - 1) ? '' : ', '}</span>
                          )
                      ) : null
                    }
                      <%_ } else { _%>
                        <%_ if (dto === 'no') { _%>
                    {<%= entityInstance + "." + relationshipFieldName %> ? <%= entityInstance + "." + relationshipFieldName + "." + otherEntityField %> : ''}
                        <%_ } else { _%>
                    {<%= entityInstance + "." + relationshipFieldName + otherEntityFieldCapitalized %> ? <%= entityInstance + "." + relationshipFieldName + otherEntityFieldCapitalized %> : ''}
                          <%_ } _%>
                      <%_ } _%>
                    <%_ } else { _%>
                      <%_ if (relationshipType === 'many-to-many') { _%>
                    {
                      (<%= entityInstance %>.<%= relationshipFieldNamePlural %>) ?
                          (<%= entityInstance %>.<%= relationshipFieldNamePlural %>.map((val, j) =>
                              <span key={j}><Link to={`<%= otherEntityName %>/${val.id}`}>{val.<%= otherEntityField %>}</Link>{(j === <%= entityInstance %>.<%= relationshipFieldNamePlural %>.length - 1) ? '' : ', '}</span>
                          )
                      ) : null
                    }
                      <%_ } else { _%>
                          <%_ if (dto === 'no') { _%>
                    {<%= entityInstance + "." + relationshipFieldName %> ?
                    <Link to={`<%= otherEntityName %>/${<%= entityInstance + "." + relationshipFieldName + ".id}" %>`}>
                      {<%= entityInstance + "." + relationshipFieldName + "." + otherEntityField %>}
                    </Link> : ''}
                          <%_ } else { _%>
                    {<%= entityInstance + "." + relationshipFieldName + otherEntityFieldCapitalized %> ?
                    <Link to={`<%= otherEntityName %>/${<%= entityInstance + "." + relationshipFieldName + "Id}" %>`}>
                      {<%= entityInstance + "." + relationshipFieldName + otherEntityFieldCapitalized %>}
                    </Link> : ''}
                          <%_ } _%>
                      <%_ } _%>
                    <%_ } _%>
                  </td>
                  <%_ } _%>
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

const mapDispatchToProps = { <%_ for (idx in relationships) { const relationshipFieldNamePlural = relationships[idx].relationshipFieldNamePlural;const otherEntityNamePlural = relationships[idx].otherEntityNamePlural; _%>
 get<%= otherEntityNamePlural %>,<%_ } _%><%_ if (searchEngine === 'elasticsearch') { _%>
 getSearchEntities,<%_ } _%>
 getEntities };

export default connect(mapStateToProps, mapDispatchToProps)(<%= entityReactName %>);
