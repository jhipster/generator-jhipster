import * as React from 'react';
import { Translate, translate } from 'react-jhipster';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { AvForm, AvField } from 'availity-reactstrap-validation';

export interface ILoginModalProps {
  showModal: boolean;
  loginError?: boolean;
  handleLogin: Function;
  handleClose: Function;
}

export interface ILoginModalState {
  username: string;
  password: string;
}

class LoginModal extends React.Component<ILoginModalProps, ILoginModalState> {

  static defaultProps = {
    loginError: false
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      username: null,
      password: null
    };
  }

  handleSubmit = () => {
    const { handleLogin } = this.props;
    const { username, password } = this.state;
    handleLogin(username, password, false);  // FIXME remember me value must be passed
  }

  handleUsernameChange = event => {
    this.setState({ username: event.target.value });
  }

  handlePasswordChange = event => {
    this.setState({ password: event.target.value });
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
                    value={this.state.username}
                    required errorMessage="Username cannot be empty!"
                    onChange={this.handleUsernameChange}
                  />
                  <AvField
                    name="password" type="password"
                    label={<Translate contentKey="login.form.password" />}
                    placeholder={translate('login.form.password.placeholder')}
                    value={this.state.password}
                    required errorMessage="Password cannot be empty!"
                    onChange={this.handlePasswordChange}
                  />
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
