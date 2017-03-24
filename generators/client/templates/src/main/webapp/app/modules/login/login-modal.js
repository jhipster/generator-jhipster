import React, { Component, PropTypes } from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import Translate from 'react-translate-component';

class LoginModal extends Component {

  static propTypes = {
    authenticationError: PropTypes.bool,
    handleLogin: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleForgottenPass: PropTypes.func.isRequired,
    handleRegister: PropTypes.func.isRequired,
    showModal: PropTypes.bool.isRequired
  };

  static defaultProps = {
    authenticationError: false
  };

  constructor(props, context) {
    super(props, context);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.state = {
      username: null,
      password: null
    };
  }

  handleSubmit() {
    const { handleLogin } = this.props;
    const { username, password } = this.state;
    handleLogin(username, password, false);  // FIXME remember me value must be passed
  }

  handleUsernameChange(event) {
    this.setState({ username: event.target.value });
  }

  handlePasswordChange(event) {
    this.setState({ password: event.target.value });
  }

  render() {
    const { authenticationError, handleClose } = this.props;
    const actions = [
      <FlatButton
        label={<Translate content="entity.action.cancel" />}
        onTouchTap={handleClose}
      />,
      <FlatButton
        label={<Translate content="login.form.button" />}
        primary
        keyboardFocused
        onTouchTap={this.handleSubmit}
      />
    ];
    return (
      <Dialog
        title={<h3><Translate content="login.title" /></h3>}
        actions={actions}
        modal autoScrollBodyContent
        open={this.props.showModal}
        onRequestClose={handleClose}
      >
        <div className="row">
          <div className="col-md-12">
            { authenticationError ?
              <div className="alert alert-danger">
                <strong>Failed to sign in!</strong> <Translate content="login.messages.error.authentication" />
              </div>
              : null
            }
          </div>
          <div className="col-md-12">
            <TextField
              id="username" name="username" fullWidth
              hintText="Username"
              floatingLabelText={<Translate content="global.form.username" />}
              floatingLabelFixed
              onChange={this.handleUsernameChange}
            /><br />
            <TextField
              id="password" name="password" fullWidth type="password"
              hintText="Password"
              floatingLabelText={<Translate content="login.form.password" />}
              floatingLabelFixed
              onChange={this.handlePasswordChange}
            /><br />
            <p />
            <div className="alert alert-warning">
              <a className="alert-link" onClick={() => this.props.handleForgottenPass}><Translate content="login.password.forgot" /></a>
            </div>
            <div className="alert alert-warning">
              You do not have an account yet?
              <a className="alert-link" onClick={() => this.props.handleRegister}><Translate content="global.messages.info.register.link" /></a>
            </div>
          </div>
        </div>
      </Dialog>
    );
  }
}

export default LoginModal;
