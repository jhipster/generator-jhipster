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
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Label<% if (haveFieldWithJavadoc) { %>, UncontrolledTooltip<% } %> } from 'reactstrap';
import { AvForm, AvGroup, AvInput, AvFeedback } from 'availity-reactstrap-validation';
import { Translate, ICrudGetAction, ICrudPutAction } from 'react-jhipster';
import { FaBan, FaFloppyO } from 'react-icons/lib/fa';

import { getEntity, updateEntity, createEntity } from './<%= entityFileName %>.reducer';
// tslint:disable-next-line:no-unused-variable
import { convertDateTimeFromServer } from '../../shared/util/date-utils';

export interface I<%= entityReactName %>DialogProps {
  getEntity: ICrudGetAction;
  updateEntity: ICrudPutAction;
  createEntity: ICrudPutAction;
  loading: boolean;
  updating: boolean;
  <%= entityInstance %>: any;
  <%_ for (idx in relationships) {
    const relationshipFieldNamePlural = relationships[idx].relationshipFieldNamePlural;
    const otherEntityNamePlural = relationships[idx].otherEntityNamePlural;
  _%>
  <%= otherEntityNamePlural %>: any[];
  <%_ } _%>
  match: any;
  history: any;
}

export interface I<%= entityReactName %>DialogState {
  showModal: boolean;
  isNew: boolean;
  <%_ for (idx in relationships) {
    const relationshipType = relationships[idx].relationshipType;
    const relationshipNameHumanized = relationships[idx].relationshipNameHumanized;
    const otherEntityField = relationships[idx].otherEntityField;
    const relationshipFieldName = relationships[idx].relationshipFieldName;
  _%>
  <%_ if (relationshipType === 'many-to-many' && relationships[idx].ownerSide === true) { _%>
  ids<%= relationshipNameHumanized %>: any[];
  <%_ } else { _%>
  <%= relationshipFieldName %>Id: number;
  <%_ } _%>
  <%_ } _%>
}

export class <%= entityReactName %>Dialog extends React.Component<I<%= entityReactName %>DialogProps, I<%= entityReactName %>DialogState> {

  constructor(props) {
    super(props);
    this.state = {
      isNew: !this.props.match.params || !this.props.match.params.id,
      <%_ for (idx in relationships) {
        const relationshipType = relationships[idx].relationshipType;
        const relationshipNameHumanized = relationships[idx].relationshipNameHumanized;
        const relationshipFieldName = relationships[idx].relationshipFieldName;
      _%>
      <%_ if (relationshipType === 'many-to-many' && relationships[idx].ownerSide === true) { _%>
      ids<%= relationshipNameHumanized %>: [],
      <%_ } else { _%>
      <%= relationshipFieldName %>Id: 0,
      <%_ } _%>
      <%_ } _%>
      showModal: true
    };
  }

  componentDidMount() {
    !this.state.isNew && this.props.getEntity(this.props.match.params.id);
  }

  saveEntity = (event, errors, values) => {
    <%_ for (idx in fields) {
        const fieldType = fields[idx].fieldType;
    _%>
    <%_ if (fieldType === 'Instant' || fieldType === 'ZonedDateTime')  { _%>
    values.<%=fields[idx].fieldName%> = new Date(values.<%=fields[idx].fieldName%>);
    <%_ } _%>
    <%_ } _%>
    if (this.state.isNew) {
      this.props.createEntity(values);
    } else {
      this.props.updateEntity(values);
    }
    this.handleClose();
  }

  handleClose = () => {
    this.setState({
        showModal: false
    });
    this.props.history.push('/<%= entityFileName %>');
  }

<%_ for (idx in relationships) {
const relationshipType = relationships[idx].relationshipType;
const relationshipFieldNamePlural = relationships[idx].relationshipFieldNamePlural;
const otherEntityNamePlural = relationships[idx].otherEntityNamePlural;
const relationshipNameHumanized = relationships[idx].relationshipNameHumanized;
const otherEntityField = relationships[idx].otherEntityField;
const relationshipFieldName = relationships[idx].relationshipFieldName;
const ownerSide = relationships[idx].ownerSide;
_%>
  <%_ if (relationshipType === 'many-to-many' && relationships[idx].ownerSide === true) { _%>
  <%= relationshipFieldName %>Update = element => {
    const <%= otherEntityField %> = element.target.value;
    const list = [];
    for (const i in element.target.selectedOptions) {
        if (element.target.selectedOptions[i]) {
            const prop = element.target.selectedOptions[i].value;
            for (const j in this.props.<%= otherEntityNamePlural %>) {
                if (prop === this.props.<%= otherEntityNamePlural %>[j].<%= otherEntityField %>) {
                    list.push(this.props.<%= otherEntityNamePlural %>[j]);
                }
            }
        }
    }
    this.setState({
        ids<%= relationshipNameHumanized %>: list
    });
  }

  <%_ } else if (relationshipType === 'many-to-one' || relationshipType === 'one-to-one' && ownerSide === true) { _%>
  <%= relationshipFieldName %>Update = element => {
    const <%= otherEntityField %> = element.target.value;
    for (const i in this.props.<%= otherEntityNamePlural %>) {
        if (<%= otherEntityField %>.toString() === this.props.<%= otherEntityNamePlural %>[i].<%= otherEntityField %>.toString()) {
            this.setState({
                <%= relationshipFieldName %>Id: this.props.<%= otherEntityNamePlural %>[i].id
            });
        }
    }
  }

  <%_ } _%>
<%_ } _%>
<%_ for (idx in relationships) {
    const relationshipType = relationships[idx].relationshipType;
    const relationshipFieldNamePlural = relationships[idx].relationshipFieldNamePlural;
    const otherEntityNamePlural = relationships[idx].otherEntityNamePlural;
    const relationshipNameHumanized = relationships[idx].relationshipNameHumanized;
    const otherEntityField = relationships[idx].otherEntityField;
    _%>
<%_ if (relationshipType === 'many-to-many' && relationships[idx].ownerSide === true) { _%>
  display<%= relationshipNameHumanized %>(value: any) {
    if (this.state.ids<%= relationshipNameHumanized %> && this.state.ids<%= relationshipNameHumanized %>.length !== 0) {
        const list = [];
        for (const i in this.state.ids<%= relationshipNameHumanized %>) {
            if (this.state.ids<%= relationshipNameHumanized %>[i]) {
                list.push(this.state.ids<%= relationshipNameHumanized %>[i].<%= otherEntityField %>);
            }
        }
        return list;
    }
    if (value.<%= otherEntityNamePlural %> && value.<%= otherEntityNamePlural %>.length !== 0) {
        const list = [];
        for (const i in value.<%= otherEntityNamePlural %>) {
            if (value.<%= otherEntityNamePlural %>[i]) {
                list.push(value.<%= otherEntityNamePlural %>[i].<%= otherEntityField %>);
            }
        }
        return list;
    }
    return null;
  }

<%_ } _%>
<%_ } _%>
  render() {
    const isInvalid = false;
    const { <%= entityInstance %>,<%_ for (idx in relationships) { const relationshipFieldNamePlural = relationships[idx].relationshipFieldNamePlural;const otherEntityNamePlural = relationships[idx].otherEntityNamePlural; _%>
 <%= otherEntityNamePlural %>,<%_ } _%>
 loading, updating } = this.props;
    const { showModal, isNew } = this.state;
    return (
      <%_ const keyPrefix = angularAppName + '.'+ entityTranslationKey + '.'; _%>
      <Modal isOpen={showModal} modalTransition={{ timeout: 20 }} backdropTransition={{ timeout: 10 }}
        toggle={this.handleClose} size="lg">
      <ModalHeader toggle={this.handleClose}>
        <Translate contentKey="<%= keyPrefix %>home.createOrEditLabel">Create or edit a <%= entityClass %></Translate>
      </ModalHeader>
      { loading ? <p>Loading...</p>
      : <AvForm model={isNew ? {} : <%= entityInstance %>} onSubmit={this.saveEntity} >
          <ModalBody>
            { <%= entityInstance %>.id ?
              <AvGroup>
                <Label for="id"><Translate contentKey="global.field.id">ID</Translate></Label>
                <AvInput type="text" className="form-control" name="id" required readOnly/>
              </AvGroup>
              : null
            }
            <%_ for (idx in fields) {
                const fieldType = fields[idx].fieldType;
            _%>
            <AvGroup>
            <%_ if (fieldType === 'Boolean') { _%>
              <Label id="<%= fields[idx].fieldName %>Label" check>
                <AvInput type="checkbox" className="form-control" name="<%= fields[idx].fieldName %>" />
                <Translate contentKey="<%= keyPrefix %><%= fields[idx].fieldName %>">
                  <%=fields[idx].fieldName%>
                </Translate>
              </Label>
            <%_ } else if (fieldType === 'Instant' || fieldType === 'ZonedDateTime') { _%>
              <Label id="<%= fields[idx].fieldName %>Label" for="<%= fields[idx].fieldName %>">
                <Translate contentKey="<%= keyPrefix %><%= fields[idx].fieldName %>">
                  <%=fields[idx].fieldName%>
                </Translate>
              </Label>
              <AvInput
                type="datetime-local" className="form-control" name="<%= fields[idx].fieldName %>"
                value={convertDateTimeFromServer(this.props.<%= entityInstance %>.<%= fields[idx].fieldName %>)} required
              />
              <AvFeedback>This field is required.</AvFeedback>
            <%_ } else if (fieldType === 'LocalDate') { _%>
              <Label id="<%= fields[idx].fieldName %>Label" for="<%= fields[idx].fieldName %>">
                <Translate contentKey="<%= keyPrefix %><%= fields[idx].fieldName %>">
                  <%=fields[idx].fieldName%>
                </Translate>
              </Label>
              <AvInput type="date" className="form-control" name="<%= fields[idx].fieldName %>" required />
              <AvFeedback>This field is required.</AvFeedback>
            <%_ } else if (fields[idx].fieldIsEnum) { _%>
              <Label id="<%= fields[idx].fieldName %>Label">
                <Translate contentKey="<%= keyPrefix %><%= fields[idx].fieldName %>">
                  <%=fields[idx].fieldName%>
                </Translate>
              </Label>
              <AvInput type="select"
                className="form-control"
                name="<%= fields[idx].fieldName %>"
              >
              <%_
                const enumPrefix = angularAppName + '.'+ fieldType;
                const values = fields[idx].fieldValues.replace(/\s/g, '').split(',');
                for (key in values) {
                    const value = values[key]; _%>
                <option value="<%= value %>">
                    <%=value%>
                </option>
              <%_ } _%>
              </AvInput>
            <%_ } else { _%>
              <Label id="<%= fields[idx].fieldName %>Label" for="<%= fields[idx].fieldName %>">
                <Translate contentKey="<%= keyPrefix %><%= fields[idx].fieldName %>">
                  <%=fields[idx].fieldName%>
                </Translate>
              </Label>
              <AvInput type="text" className="form-control" name="<%= fields[idx].fieldName %>" required />
              <AvFeedback>This field is required.</AvFeedback>
              <AvFeedback>This field cannot be longer than 50 characters.</AvFeedback>
            <%_ } _%>
            <%_ if (fields[idx].javadoc) { _%>
            <UncontrolledTooltip target="<%= fields[idx].fieldName %>Label">
              <%_ if (enableTranslation) { _%>
              <Translate contentKey="<%= keyPrefix %>help.<%= fields[idx].fieldName %>"/>
              <%_ } else { _%>
              <%= fields[idx].javadoc %>
              <%_ } _%>
            </UncontrolledTooltip>
            <%_ } _%>
            </AvGroup>
            <%_ } _%>
            <%_ for (idx in relationships) {
                const relationshipType = relationships[idx].relationshipType;
                const ownerSide = relationships[idx].ownerSide;
                const otherEntityName = relationships[idx].otherEntityName;
                const otherEntityNamePlural = relationships[idx].otherEntityNamePlural;
                const otherEntityNameCapitalized = relationships[idx].otherEntityNameCapitalized;
                const relationshipName = relationships[idx].relationshipName;
                const relationshipNameHumanized = relationships[idx].relationshipNameHumanized;
                const relationshipFieldName = relationships[idx].relationshipFieldName;
                const relationshipFieldNamePlural = relationships[idx].relationshipFieldNamePlural;
                const otherEntityField = relationships[idx].otherEntityField;
                const otherEntityFieldCapitalized = relationships[idx].otherEntityFieldCapitalized;
                const relationshipRequired = relationships[idx].relationshipRequired;
                const translationKey = keyPrefix + relationshipName; _%>
                <%_ if (relationshipType === 'many-to-one' || (relationshipType === 'one-to-one' && ownerSide === true && otherEntityName === 'user')) { _%>
            <AvGroup>
              <Label for="<%= relationshipFieldName %>.<%= otherEntityField %>">
                <Translate contentKey="<%= translationKey %>"><%= relationshipNameHumanized %></Translate>
              </Label>
              <%_ if (dto === 'no') { _%>
                  <%_ if (!relationshipRequired) { _%>
              <AvInput type="select"
                className="form-control"
                name="<%= relationshipFieldName %>.<%= otherEntityField %>"
                onChange={this.<%= relationshipFieldName %>Update}>
                <option value="" key="0" />
                {
                  <%= otherEntityNamePlural %>.map(otherEntity =>
                    <option
                      value={otherEntity.<%=otherEntityField%>}
                      key={otherEntity.id}>
                      {otherEntity.<%=otherEntityField%>}
                    </option>
                  )
                }
              </AvInput>
              <AvInput type="hidden"
                name="<%= relationshipFieldName %>.id"
                value={this.state.<%= relationshipFieldName %>Id} />
                <%_ } else { _%>
              <AvInput type="select"
                className="form-control"
                name="<%= relationshipFieldName %>.<%= otherEntityField %>"
                onChange={this.<%= relationshipFieldName %>Update}>
                {
                  <%= otherEntityNamePlural %>.map(otherEntity =>
                    <option
                      value={otherEntity.<%=otherEntityField%>}
                      key={otherEntity.id}>
                      {otherEntity.<%=otherEntityField%>}
                    </option>
                  )
                }
              </AvInput>
              <AvInput type="hidden"
                name="<%= relationshipFieldName %>.id"
                value={this.state.<%= relationshipFieldName %>Id} />
                <%_ } _%>
              <%_ } else { _%>
                <%_ if (!relationshipRequired) { _%>
                  <AvInput type="select"
                    className="form-control"
                    name="<%= relationshipFieldName %>Id"
                    onChange={this.<%= relationshipFieldName %>Update}>
                    <option value="" key="0" />
                    {
                      <%= otherEntityNamePlural %>.map(otherEntity =>
                        <option
                          value={otherEntity.id}
                          key={otherEntity.id}>
                          {otherEntity.<%=otherEntityField%>}
                        </option>
                      )
                    }
                  </AvInput>
                <%_ } else { _%>
                  <AvInput type="select"
                    className="form-control"
                    name="<%= relationshipFieldName %>Id"
                    onChange={this.<%= relationshipFieldName %>Update}>
                    {
                      <%= otherEntityNamePlural %>.map(otherEntity =>
                        <option
                          value={otherEntity.id}
                          key={otherEntity.id}>
                          {otherEntity.<%=otherEntityField%>}
                        </option>
                      )
                    }
                  </AvInput>
                <%_ } _%>
              <%_ } _%>
            </AvGroup>
                <%_ } else if (relationshipType === 'one-to-one' && ownerSide === true) { _%>
            <AvGroup>
              <Label for="<%= relationshipFieldName %>.<%= otherEntityField %>">
                <Translate contentKey="<%= translationKey %>"><%= relationshipNameHumanized %></Translate>
              </Label>
                <%_ if (dto === 'no') { _%>
                  <AvInput type="select"
                    className="form-control"
                    name="<%= relationshipFieldName %>.<%=otherEntityField%>"
                    onChange={this.<%= relationshipFieldName %>Update}>
                    <option value="" key="0" />
                    {
                      <%= otherEntityNamePlural %>.map(otherEntity =>
                        <option
                          value={otherEntity.<%=otherEntityField%>}
                          key={otherEntity.id}>
                          {otherEntity.<%=otherEntityField%>}
                        </option>
                      )
                    }
                  </AvInput>
                  <AvInput type="hidden"
                    name="<%= relationshipFieldName %>.id"
                    value={this.state.<%= relationshipFieldName %>Id} />
                <%_ } else { _%>
                  <AvInput type="select"
                    className="form-control"
                    name="<%= relationshipFieldName %>Id"
                    onChange={this.<%= relationshipFieldName %>Update}>
                    <option value="" key="0" />
                    {
                      <%= otherEntityNamePlural %>.map(otherEntity =>
                        <option
                          value={otherEntity.id}
                          key={otherEntity.id}>
                          {otherEntity.<%=otherEntityField%>}
                        </option>
                      )
                    }
                  </AvInput>
                <%_ } _%>
            </AvGroup>
                <%_ } else if (relationshipType === 'many-to-many' && relationships[idx].ownerSide === true) { _%>
            <AvGroup>
              <Label for="<%= otherEntityNamePlural %>"><Translate contentKey="<%= translationKey %>"><%= relationshipNameHumanized %></Translate></Label>
              <AvInput type="select"
                multiple
                className="form-control"
                name="fake<%= otherEntityNamePlural %>"
                value={this.display<%= relationshipNameHumanized %>(<%= entityInstance %>)}
                onChange={this.<%= relationshipFieldName %>Update}>
                <option value="" key="0" />
                {
                  (<%= otherEntityNamePlural %>) ? (<%=otherEntityNamePlural.toLowerCase() %>.map(otherEntity =>
                  <option
                      value={otherEntity.<%=otherEntityField%>}
                      key={otherEntity.id}>
                      {otherEntity.<%=otherEntityField%>}
                  </option>
                  )) : null
                }
              </AvInput>
              <AvInput type="hidden"
                name="<%= otherEntityNamePlural %>"
                value={this.state.ids<%= relationshipNameHumanized %>}
              />
            </AvGroup>
            <%_ } _%>
          <%_ } _%>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={this.handleClose}>
              <FaBan/>&nbsp;
              <Translate contentKey="entity.action.cancel">Cancel</Translate>
            </Button>
            <Button color="primary" type="submit" disabled={isInvalid || updating}>
              <FaFloppyO/>&nbsp;
              <Translate contentKey="entity.action.save">Save</Translate>
            </Button>
          </ModalFooter>
        </AvForm>
      }
    </Modal>
    );
  }
}

const mapStateToProps = storeState => ({
  <%= entityInstance %>: storeState.<%= entityInstance %>.entity,
  <%_ for (idx in relationships) {
    const relationshipFieldNamePlural = relationships[idx].relationshipFieldNamePlural;
    const otherEntityNamePlural = relationships[idx].otherEntityNamePlural;
  _%>
  <%= otherEntityNamePlural %>: storeState.<%= entityInstance %>.<%= otherEntityNamePlural %>,
  <%_ } _%>
  loading: storeState.<%= entityInstance %>.loading,
  updating: storeState.<%= entityInstance %>.updating
});

const mapDispatchToProps = { getEntity, updateEntity, createEntity };

export default connect(mapStateToProps, mapDispatchToProps)(<%= entityReactName %>Dialog);
