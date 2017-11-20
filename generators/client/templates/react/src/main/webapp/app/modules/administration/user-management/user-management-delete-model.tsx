import * as React from 'react';
import { connect } from 'react-redux';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FaBan, FaTrash } from 'react-icons/lib/fa';

import { ICrudGetAction, ICrudDeleteAction } from '../../../shared/model/redux-action.type';
import { getUser, deleteUser } from '../../../reducers/user-management';

export interface IUserManagementDeleteModalProps {
  getUser: ICrudGetAction;
  deleteUser: ICrudDeleteAction;
  user: any;
  match: any;
  history: any;
}

export interface IUserManagementDeleteModalState {
  showModal: boolean;
}
export class UserManagementDeleteModel extends React.Component<IUserManagementDeleteModalProps, IUserManagementDeleteModalState> {

  constructor(props) {
    super(props);
    this.state = {
      showModal: true
    };
  }

  componentDidMount() {
    this.props.getUser(this.props.match.params.login);
  }

  confirmDelete = () => {
    this.props.deleteUser(this.props.user.login);
    this.handleClose();
  }

  handleClose = () => {
    this.setState({
        showModal: false
    });
    this.props.history.push('/admin/user-management');
  }

  render() {
    const { user } = this.props;
    const { showModal } = this.state;
    return (
      <Modal
        isOpen={showModal} modalTransition={{ timeout: 20 }} backdropTransition={{ timeout: 10 }}
        toggle={this.handleClose}
      >
      <ModalHeader toggle={this.handleClose}><Translate contentKey="entity.delete.title">Confirm delete operation</Translate></ModalHeader>
      <ModalBody>
        <Translate contentKey="userManagement.delete.question" interpolate={{ login: user.login }}>Are you sure you want to delete this User?</Translate>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={this.handleClose}>
          <FaBan/>&nbsp;
          <Translate contentKey="entity.action.cancel">Cancel</Translate>
        </Button>
        <Button color="danger" onClick={this.confirmDelete}>
          <FaTrash/>&nbsp;
          <Translate contentKey="entity.action.delete">Delete</Translate>
        </Button>
      </ModalFooter>
    </Modal>
    );
  }
}

const mapStateToProps = storeState => ({
  user: storeState.userManagement.user
});

const mapDispatchToProps = { getUser, deleteUser };

export default connect(mapStateToProps, mapDispatchToProps)(UserManagementDeleteModel);
