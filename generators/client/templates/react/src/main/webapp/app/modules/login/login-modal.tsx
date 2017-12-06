import * as React from 'react';
import { Translate, translate } from 'react-jhipster';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Label } from 'reactstrap';
import { AvForm, AvField, AvGroup, AvInput } from 'availity-reactstrap-validation';

export interface ILoginModalProps {
  showModal: boolean;
  loginError: boolean;
  handleLogin: Function;
  handleClose: Function;
}

class LoginModal extends React.Component<ILoginModalProps, {}> {

  constructor(props, context) {
    super(props, context);
    this.state = {};
  }

  handleSubmit = (event, errors, { username, password, rememberMe }) => {
    const { handleLogin } = this.props;
    handleLogin(username, password, rememberMe);
  }

  render() {
    const { loginError, handleClose } = this.props;

    return (
      <Modal isOpen={this.props.showModal} toggle={handleClose} backdrop="static" id="login-page">
        <AvForm onSubmit={this.handleSubmit}>
          <ModalHeader toggle={handleClose} id="login-title"><Translate contentKey="login.title" /></ModalHeader>
          <ModalBody>
            <div className="row">
              <div className="col-md-12">
                { loginError ?
                  <div className="alert alert-danger">
                    <Translate contentKey="login.messages.error.authentication" />
                  </div>
                  : null
                }
              </div>
              <div className="col-md-12">
                <AvField
                  name="username"
                  label={<Translate contentKey="global.form.username" />}
                  placeholder={translate('global.form.username.placeholder')}
                  required errorMessage="Username cannot be empty!"
                />
                <AvField
                  name="password" type="password"
                  label={<Translate contentKey="login.form.password" />}
                  placeholder={translate('login.form.password.placeholder')}
                  required errorMessage="Password cannot be empty!"
                />
                <AvGroup>
                  <Label check inline for="rememberMe" className="form-check-label">
                    <AvInput type="checkbox" name="rememberMe" /> <Translate contentKey="login.form.rememberme" />
                  </Label>
                </AvGroup>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={handleClose} tabIndex="1"><Translate contentKey="entity.action.cancel" /></Button>{' '}
            <Button color="primary" type="submit"><Translate contentKey="login.form.button" /></Button>
          </ModalFooter>
        </AvForm>
      </Modal>
    );
  }
}

export default LoginModal;
