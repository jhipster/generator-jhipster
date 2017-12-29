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
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Label } from 'reactstrap';
import { AvForm, AvGroup, AvInput, AvFeedback } from 'availity-reactstrap-validation';
import { Translate } from 'react-jhipster';
import { FaBan, FaFloppyO } from 'react-icons/lib/fa';
import * as moment from 'moment';

import { ICrudGetAction, ICrudPutAction } from '../../shared/model/redux-action.type';
import { getEntity, updateEntity, createEntity } from './<%= entityFileName %>.reducer';
import { convertDateTimeFromServer } from '../../shared/util/date-utils';
import { APP_LOCAL_DATETIME_FORMAT } from '../../config/constants';

export interface I<%= entityReactName %>DialogProps {
  getEntity: ICrudGetAction;
  updateEntity: ICrudPutAction;
  createEntity: ICrudPutAction;
  loading: boolean;
  updating: boolean;
  <%= entityInstance %>: any;
  <%_ for (idx in relationships) {
    const relationshipFieldNamePlural = relationships[idx].relationshipFieldNamePlural;
  _%>
  <%= relationshipFieldNamePlural %>: any[];
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
    const relationshipFieldNamePlural = relationships[idx].relationshipFieldNamePlural;
  _%>
  <%_ if (relationshipType === 'many-to-many' && relationships[idx].ownerSide === true) { _%>
  ids<%= relationshipNameHumanized %>: any[];
  <%_ } else { _%>
  id<%= relationshipNameHumanized %>: number;
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
        const relationshipFieldNamePlural = relationships[idx].relationshipFieldNamePlural;
      _%>
      <%_ if (relationshipType === 'many-to-many' && relationships[idx].ownerSide === true) { _%>
      ids<%= relationshipNameHumanized %>: [],
      <%_ } else { _%>
      id<%= relationshipNameHumanized %>: 0,
      <%_ } _%>
      <%_ } _%>
      showModal: true
    };
<%_ for (idx in relationships) {
const relationshipType = relationships[idx].relationshipType;
const relationshipFieldNamePlural = relationships[idx].relationshipFieldNamePlural;
const relationshipNameHumanized = relationships[idx].relationshipNameHumanized;
_%>
<%_ if (relationshipType === 'many-to-many' && relationships[idx].ownerSide === true || relationshipType === 'many-to-one') { _%>
    this.update<%= relationshipNameHumanized %> = this.update<%= relationshipNameHumanized %>.bind(this);
<%_ } _%>
<%_ } _%>
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
    this.props.history.push('/<%= entityInstance %>');
  }

<%_ for (idx in relationships) {
const relationshipType = relationships[idx].relationshipType;
const relationshipFieldNamePlural = relationships[idx].relationshipFieldNamePlural;
const relationshipNameHumanized = relationships[idx].relationshipNameHumanized;
const otherEntityField = relationships[idx].otherEntityField;
_%>
  <%_ if (relationshipType === 'many-to-many' && relationships[idx].ownerSide === true) { _%>
  update<%= relationshipNameHumanized %>(element) {
    const <%= otherEntityField %> = element.target.value;
    const list = [];
    for (const i in element.target.selectedOptions) {
        if (element.target.selectedOptions[i]) {
            const prop = element.target.selectedOptions[i].value;
            for (const j in this.props.<%= relationshipFieldNamePlural %>) {
                if (prop === this.props.<%= relationshipFieldNamePlural %>[j].<%= otherEntityField %>) {
                    list.push(this.props.<%= relationshipFieldNamePlural %>[j]);
                }
            }
        }
    }
    this.setState({
        ids<%= relationshipNameHumanized %>: list
    });
  }

  <%_ } else if (relationshipType === 'many-to-one') { _%>
  update<%= relationshipNameHumanized %>(element) {
    const <%= otherEntityField %> = element.target.value;
    for (const i in this.props.<%= relationshipFieldNamePlural %>) {
        if (<%= otherEntityField %> === this.props.<%= relationshipFieldNamePlural %>[i].<%= otherEntityField %>) {
            this.setState({
                id<%= relationshipNameHumanized %>: this.props.<%= relationshipFieldNamePlural %>[i].id
            });
        }
    }
  }

  <%_ } _%>
<%_ } _%>
<%_ for (idx in relationships) {
    const relationshipType = relationships[idx].relationshipType;
    const relationshipFieldNamePlural = relationships[idx].relationshipFieldNamePlural;
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
    if (value.<%= relationshipFieldNamePlural %> && value.<%= relationshipFieldNamePlural %>.length !== 0) {
        const list = [];
        for (const i in value.<%= relationshipFieldNamePlural %>) {
            if (value.<%= relationshipFieldNamePlural %>[i]) {
                list.push(value.<%= relationshipFieldNamePlural %>[i].<%= otherEntityField %>);
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
    const { <%= entityInstance %>,<%_ for (idx in relationships) { const relationshipFieldNamePlural = relationships[idx].relationshipFieldNamePlural; _%>
 <%= relationshipFieldNamePlural %>,<%_ } _%>
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
                        <Label check>
                            <AvInput type="checkbox" className="form-control" name="<%= fields[idx].fieldName %>" />
                            <Translate contentKey="<%= keyPrefix %><%= fields[idx].fieldName %>">
                                <%=fields[idx].fieldName%>
                            </Translate>
                        </Label>
                    <%_ } else if (fieldType === 'Instant' || fieldType === 'ZonedDateTime') { _%>
                        <Label for="login">
                            <Translate contentKey="<%= keyPrefix %><%= fields[idx].fieldName %>">
                                <%=fields[idx].fieldName%>
                            </Translate>
                        </Label>
                        <AvInput type="datetime-local" className="form-control" name="<%= fields[idx].fieldName %>" value={convertDateTimeFromServer(this.props.<%= entityInstance %>.<%= fields[idx].fieldName %>)} required />
                        <AvFeedback>This field is required.</AvFeedback>
                    <%_ } else if (fieldType === 'LocalDate') { _%>
                        <Label for="login">
                            <Translate contentKey="<%= keyPrefix %><%= fields[idx].fieldName %>">
                                <%=fields[idx].fieldName%>
                            </Translate>
                        </Label>
                        <AvInput type="date" className="form-control" name="<%= fields[idx].fieldName %>" required />
                        <AvFeedback>This field is required.</AvFeedback>
                    <%_ } else { _%>
                        <Label for="login">
                            <Translate contentKey="<%= keyPrefix %><%= fields[idx].fieldName %>">
                                <%=fields[idx].fieldName%>
                            </Translate>
                        </Label>
                        <AvInput type="text" className="form-control" name="<%= fields[idx].fieldName %>" required />
                        <AvFeedback>This field is required.</AvFeedback>
                        <AvFeedback>This field cannot be longer than 50 characters.</AvFeedback>
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
                        <Label for="langKey"><Translate contentKey="<%= translationKey %>"><%= relationshipNameHumanized %></Translate></Label>
                        <%_ if (dto === 'no') { _%>
                            <%_ if (!relationshipRequired) { _%>
                                <AvInput type="select"
                                    className="form-control"
                                    name="<%= relationshipFieldName %>.<%= otherEntityField %>"
                                    onChange={this.update<%= relationshipNameHumanized %>}>
                                    <option value="" key="0" />
                                    {
                                        <%=otherEntityNamePlural.toLowerCase() %>.map(otherEntity =>
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
                                    value={this.state.id<%= relationshipNameHumanized %>} />
                            <%_ } else { _%>
                                TODO 1
                            <%_ } _%>
                        <%_ } else { _%>
                            <%_ if (!relationshipRequired) { _%>
                                TODO 2
                            <%_ } else { _%>
                                TODO 3
                            <%_ } _%>
                        <%_ } _%>   
                    </AvGroup>
                <%_ } else if (relationshipType === 'one-to-one' && ownerSide === true) { _%>
                    <div className="form-group">
                        TODO 4
                    </div>
                <%_ } else if (relationshipType === 'many-to-many' && relationships[idx].ownerSide === true) { _%>
                    <AvGroup>
                        <Label for="langKey"><Translate contentKey="<%= translationKey %>"><%= relationshipNameHumanized %></Translate></Label>
                        <AvInput type="select"
                            multiple
                            className="form-control"
                            name="fake<%= relationshipFieldNamePlural %>"
                            value={this.display<%= relationshipNameHumanized %>(<%= entityInstance %>)}
                            onChange={this.update<%= relationshipNameHumanized %>}>
                            <option value="" key="0" />
                            {
                                (<%=otherEntityNamePlural.toLowerCase() %>) ? (<%=otherEntityNamePlural.toLowerCase() %>.map(otherEntity =>
                                <option
                                    value={otherEntity.<%=otherEntityField%>}
                                    key={otherEntity.id}>
                                    {otherEntity.<%=otherEntityField%>}
                                </option>
                                )) : null
                            }
                        </AvInput>
                        <AvInput type="hidden"
                            name="<%= relationshipFieldNamePlural %>"
                            value={this.state.ids<%= relationshipNameHumanized %>} />
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
  _%>
  <%= relationshipFieldNamePlural %>: storeState.<%= entityInstance %>.<%= relationshipFieldNamePlural %>,
  <%_ } _%>
  loading: storeState.<%= entityInstance %>.loading,
  updating: storeState.<%= entityInstance %>.updating
});

const mapDispatchToProps = { getEntity, updateEntity, createEntity };

export default connect(mapStateToProps, mapDispatchToProps)(<%= entityReactName %>Dialog);
