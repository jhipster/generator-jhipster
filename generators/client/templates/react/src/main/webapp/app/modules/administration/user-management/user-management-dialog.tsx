import * as React from 'react';
import { connect } from 'react-redux';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Label } from 'reactstrap';
import { AvForm, AvGroup, AvInput, AvFeedback } from 'availity-reactstrap-validation';
import { Translate, ICrudGetAction, ICrudPutAction } from 'react-jhipster';
import { FaBan, FaFloppyO } from 'react-icons/lib/fa';

import { getUser, getRoles, updateUser, createUser } from '../../../reducers/user-management';
<%_ if (enableTranslation) { _%>
import { locales } from '../../../config/translation';
<%_ } _%>

export interface IUserManagementDialogProps {
  getUser: ICrudGetAction;
  getRoles: ICrudGetAction;
  updateUser: ICrudPutAction;
  createUser: ICrudPutAction;
  loading: boolean;
  updating: boolean;
  user: any;
  roles: any[];
  match: any;
  history: any;
}

export interface IUserManagementDialogState {
  showModal: boolean;
  isNew: boolean;
}

export class UserManagementDialog extends React.Component<IUserManagementDialogProps, IUserManagementDialogState> {

  constructor(props) {
    super(props);
    this.state = {
      showModal: true,
      isNew: !this.props.match.params || !this.props.match.params.login
    };
  }

  componentDidMount() {
    !this.state.isNew && this.props.getUser(this.props.match.params.login);
    this.props.getRoles();
  }

  saveUSer = (event, errors, values) => {
    if (this.state.isNew) {
      this.props.createUser(values);
    } else {
      this.props.updateUser(values);
    }
    this.handleClose();
  }

  handleClose = () => {
    this.setState({
        showModal: false
    });
    this.props.history.push('/admin/user-management');
  }

  render() {
    const isInvalid = false;
    const { user, loading, updating, roles } = this.props;
    const { showModal, isNew } = this.state;
    return (
      <Modal
        isOpen={showModal} modalTransition={{ timeout: 20 }} backdropTransition={{ timeout: 10 }}
        toggle={this.handleClose} size="lg"
      >
      <ModalHeader toggle={this.handleClose}><Translate contentKey="userManagement.home.createOrEditLabel">Create or edit a User</Translate></ModalHeader>
      { loading ? <p>Loading...</p>
      : <AvForm model={isNew ? {} : user} onSubmit={this.saveUSer} >
          <ModalBody>
            { user.id ?
              <AvGroup>
                <Label for="id"><Translate contentKey="global.field.id">ID</Translate></Label>
                <AvInput type="text" className="form-control" name="id" required readOnly/>
              </AvGroup>
              : null
            }
            <AvGroup>
              <Label for="login"><Translate contentKey="userManagement.login">Login</Translate></Label>
              <AvInput type="text" className="form-control" name="login" required />
              <AvFeedback>This field is required.</AvFeedback>
              <AvFeedback>This field cannot be longer than 50 characters.</AvFeedback>
            </AvGroup>
            <AvGroup>
              <Label for="firstName"><Translate contentKey="userManagement.firstName">First Name</Translate></Label>
              <AvInput type="text" className="form-control" name="firstName" />
              <AvFeedback>This field cannot be longer than 50 characters.</AvFeedback>
            </AvGroup>
            <AvGroup>
              <Label for="lastName"><Translate contentKey="userManagement.lastName">Last Name</Translate></Label>
              <AvInput type="text" className="form-control" name="lastName" />
              <AvFeedback>This field cannot be longer than 50 characters.</AvFeedback>
            </AvGroup>
            <AvGroup>
              <Label for="email"><Translate contentKey="userManagement.email">E-mail</Translate></Label>
              <AvInput type="email" className="form-control" name="email" required/>
              <AvFeedback>This field is required.</AvFeedback>
              <AvFeedback>This field cannot be longer than 100 characters.</AvFeedback>
              <AvFeedback>This field is required to be at least 5 characters.</AvFeedback>
            </AvGroup>
            <AvGroup>
              <Label check>
                <AvInput type="checkbox" name="activated" /> <Translate contentKey="userManagement.activated">Activated</Translate>
              </Label>
              <AvFeedback>This field is required.</AvFeedback>
              <AvFeedback>This field cannot be longer than 100 characters.</AvFeedback>
              <AvFeedback>This field is required to be at least 5 characters.</AvFeedback>
            </AvGroup>
            <%_ if (enableTranslation) { _%>
            <AvGroup>
              <Label for="langKey"><Translate contentKey="userManagement.langKey">Language Key</Translate></Label>
              <AvInput type="select" className="form-control" name="langKey">
                {locales.map(lang => <option value={lang} key={lang}>{lang}</option>)}
              </AvInput>
            </AvGroup>
            <%_ } _%>
            <AvGroup>
              <Label for="authorities"><Translate contentKey="userManagement.profiles">Language Key</Translate></Label>
              <AvInput type="select" className="form-control" name="authorities" multiple>
                {roles.map(role => <option value={role} key={role}>{role}</option>)}
              </AvInput>
            </AvGroup>
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
  user: storeState.userManagement.user,
  roles: storeState.userManagement.authorities,
  loading: storeState.userManagement.loading,
  updating: storeState.userManagement.updating
});

const mapDispatchToProps = { getUser, getRoles, updateUser, createUser };

export default connect(mapStateToProps, mapDispatchToProps)(UserManagementDialog);
