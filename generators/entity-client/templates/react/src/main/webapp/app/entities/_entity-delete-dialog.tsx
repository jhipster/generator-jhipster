import * as React from 'react';
import { connect } from 'react-redux';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FaBan, FaTrash } from 'react-icons/lib/fa';

import { ICrudGetAction, ICrudDeleteAction } from '../../shared/model/redux-action.type';
import { getEntity, deleteEntity } from './<%= entityFileName %>.reducer';

export interface I<%= entityReactName %>DeleteDialogProps {
  getEntity: ICrudGetAction;
  deleteEntity: ICrudDeleteAction;
  <%= entityInstance %>: any;
  match: any;
  history: any;
}

export interface I<%= entityReactName %>DeleteDialogState {
  showModal: boolean;
}
export class <%= entityReactName %>DeleteDialog extends React.Component<I<%= entityReactName %>DeleteDialogProps, I<%= entityReactName %>DeleteDialogState> {

  constructor(props) {
    super(props);
    this.state = {
      showModal: true
    };
  }

  componentDidMount() {
    this.props.getEntity(this.props.match.params.id);
  }

  confirmDelete = () => {
    this.props.deleteEntity(this.props.<%= entityInstance %>.id);
    this.handleClose();
  }

  handleClose = () => {
    this.setState({
        showModal: false
    });
    this.props.history.push('/<%= entityInstance %>');
  }

  render() {
    const { <%= entityInstance %> } = this.props;
    const { showModal } = this.state;
    return (
      <%_ const keyPrefix = angularAppName + '.'+ entityTranslationKey + '.'; _%>
      <Modal
        isOpen={showModal} modalTransition={{ timeout: 20 }} backdropTransition={{ timeout: 10 }}
        toggle={this.handleClose}
      >
      <ModalHeader toggle={this.handleClose}><Translate contentKey="entity.delete.title">Confirm delete operation</Translate></ModalHeader>
      <ModalBody>
        <Translate contentKey="<%= keyPrefix %>delete.question" interpolate={{ id: <%= entityInstance %>.id }}>Are you sure you want to delete this <%= entityClass %>?</Translate>
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
    <%= entityInstance %>: storeState.<%= entityInstance %>.entity
});

const mapDispatchToProps = { getEntity, deleteEntity };

export default connect(mapStateToProps, mapDispatchToProps)(<%= entityReactName %>DeleteDialog);
