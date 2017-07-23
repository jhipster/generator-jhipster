import * as React from 'react';
import * as Translate from 'react-translate-component';
import * as counterpart from 'counterpart';
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
    this.state = {// eslint-disable-line immutable/no-mutation
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
      <Modal isOpen={this.props.showModal} toggle={handleClose} backdrop="static">
        <AvForm onSubmit={this.handleSubmit}>
          <ModalHeader toggle={handleClose}><Translate content="login.title" /></ModalHeader>
          <ModalBody>
            <div className="row">
              <div className="col-md-12">
                { loginError ?
                  <div className="alert alert-danger">
                    <Translate content="login.messages.error.authentication" />
                  </div>
                  : null
                }
              </div>
              <div className="col-md-12">
                  <AvField
                    name="username"
                    label={<Translate content="global.form.username" />}
                    placeholder={counterpart.translate('global.form.username-placeholder')}
                    value={this.state.username}
                    required errorMessage="Username cannot be empty!"
                    onChange={this.handleUsernameChange}
                  />
                  <AvField
                    name="password" type="password"
                    label={<Translate content="global.form.password" />}
                    placeholder={counterpart.translate('global.form.password-placeholder')}
                    value={this.state.password}
                    required errorMessage="Password cannot be empty!"
                    onChange={this.handlePasswordChange}
                  />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={handleClose} tabIndex="1"><Translate content="entity.action.cancel" /></Button>{' '}
            <Button color="primary" type="submit"><Translate content="login.form.button" /></Button>
          </ModalFooter>
        </AvForm>
      </Modal>
    );
  }
}

export default LoginModal;
