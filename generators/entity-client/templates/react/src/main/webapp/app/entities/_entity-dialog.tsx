import * as React from 'react';
import { connect } from 'react-redux';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Label } from 'reactstrap';
import { AvForm, AvGroup, AvInput, AvFeedback } from 'availity-reactstrap-validation';
import { Translate } from 'react-jhipster';
import { FaBan, FaFloppyO } from 'react-icons/lib/fa';

import { ICrudGetAction, ICrudPutAction } from '../../shared/model/redux-action.type';
import { getEntity, <%_ for (idx in relationships) { const relationshipFieldNamePlural = relationships[idx].relationshipFieldNamePlural; _%>
 get<%= relationshipFieldNamePlural %>,<%_ } _%>
 updateEntity, createEntity } from './<%= entityFileName %>.reducer';
<%_ if (enableTranslation) { _%>
import { locales } from '../../config/translation';
<%_ } _%>

export interface I<%= entityReactName %>DialogProps {
  getEntity: ICrudGetAction;
  <%_ for (idx in relationships) {
    const relationshipFieldNamePlural = relationships[idx].relationshipFieldNamePlural;
  _%>
  get<%= relationshipFieldNamePlural %>: ICrudGetAction;
  <%_ } _%>
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
    const relationshipNameHumanized = relationships[idx].relationshipNameHumanized;
  _%>
  id<%= relationshipNameHumanized %>: number;
  <%_ } _%>
}

export class <%= entityReactName %>Dialog extends React.Component<I<%= entityReactName %>DialogProps, I<%= entityReactName %>DialogState> {

  constructor(props) {
    super(props);
    this.state = {
      showModal: true,
      isNew: !this.props.match.params || !this.props.match.params.id<%_ for (idx in relationships) { 
          const relationshipNameHumanized = relationships[idx].relationshipNameHumanized;
      _%>,
      id<%= relationshipNameHumanized %>: 0
      <%_ } _%>
    };
<%_ for (idx in relationships) {
const relationshipFieldNamePlural = relationships[idx].relationshipFieldNamePlural;
const relationshipNameHumanized = relationships[idx].relationshipNameHumanized;
const otherEntityField = relationships[idx].otherEntityField;
_%>
    this.update<%= relationshipNameHumanized %> = this.update<%= relationshipNameHumanized %>.bind(this);
<%_ } _%>
  }

  componentDidMount() {
    !this.state.isNew && this.props.getEntity(this.props.match.params.id);
    <%_ for (idx in relationships) {
        const relationshipFieldNamePlural = relationships[idx].relationshipFieldNamePlural;
    _%>
    this.props.get<%= relationshipFieldNamePlural %>();
    <%_ } _%>
  }

  saveEntity = (event, errors, values) => {
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
const relationshipFieldNamePlural = relationships[idx].relationshipFieldNamePlural;
const relationshipNameHumanized = relationships[idx].relationshipNameHumanized;
const otherEntityField = relationships[idx].otherEntityField;
_%>
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
                        <AvInput type="datetime" className="form-control" name="<%= fields[idx].fieldName %>" required />
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
bb
                        <%_ } _%>
                    <%_ } else { _%>
                        <%_ if (!relationshipRequired) { _%>
cc
                        <%_ } else { _%>
dd
                        <%_ } _%>
                    <%_ } _%>   
                </AvGroup>
            <%_ } else if (relationshipType === 'one-to-one' && ownerSide === true) { _%>
                <div className="form-group">
                    BBB
                </div>
            <%_ } else if (relationshipType === 'many-to-many' && relationships[idx].ownerSide === true) { _%>
                <div className="form-group">
                    CCC
                </div>
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

const mapDispatchToProps = { getEntity,<%_ for (idx in relationships) { const relationshipFieldNamePlural = relationships[idx].relationshipFieldNamePlural; _%>
 get<%= relationshipFieldNamePlural %>,<%_ } _%>
 updateEntity, createEntity };

export default connect(mapStateToProps, mapDispatchToProps)(<%= entityReactName %>Dialog);
