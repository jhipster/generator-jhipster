import * as React from 'react';
import { connect } from 'react-redux';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Label } from 'reactstrap';
import { AvForm, AvGroup, AvInput, AvFeedback } from 'availity-reactstrap-validation';
import { Translate } from 'react-jhipster';
import { FaBan, FaFloppyO } from 'react-icons/lib/fa';

import { ICrudGetAction, ICrudPutAction } from '../../shared/model/redux-action.type';
import { getEntity, updateEntity, createEntity } from './<%= entityFileName %>.reducer';
<%_ if (enableTranslation) { _%>
import { locales } from '../../config/translation';
<%_ } _%>

export interface I<%= entityReactName %>DialogProps {
  getEntity: ICrudGetAction;
  updateEntity: ICrudPutAction;
  createEntity: ICrudPutAction;
  loading: boolean;
  updating: boolean;
  <%= entityInstance %>: any;
  match: any;
  history: any;
}

export interface I<%= entityReactName %>DialogState {
  showModal: boolean;
  isNew: boolean;
}

export class <%= entityReactName %>Dialog extends React.Component<I<%= entityReactName %>DialogProps, I<%= entityReactName %>DialogState> {

  constructor(props) {
    super(props);
    this.state = {
      showModal: true,
      isNew: !this.props.match.params || !this.props.match.params.id
    };
  }

  componentDidMount() {
    !this.state.isNew && this.props.getEntity(this.props.match.params.id);
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

  render() {
    const isInvalid = false;
    const { <%= entityInstance %>, loading, updating } = this.props;
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
            <%_ for (idx in fields) { _%>
                <AvGroup>
                    <Label for="login">
                        <Translate contentKey="<%= keyPrefix %><%= fields[idx].fieldName %>">
                            <%=fields[idx].fieldName%>
                        </Translate>
                    </Label>
                    <AvInput type="text" className="form-control" name="<%= fields[idx].fieldName %>" required />
                    <AvFeedback>This field is required.</AvFeedback>
                    <AvFeedback>This field cannot be longer than 50 characters.</AvFeedback>
                </AvGroup>
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
  loading: storeState.<%= entityInstance %>.loading,
  updating: storeState.<%= entityInstance %>.updating
});

const mapDispatchToProps = { getEntity, updateEntity, createEntity };

export default connect(mapStateToProps, mapDispatchToProps)(<%= entityReactName %>Dialog);
