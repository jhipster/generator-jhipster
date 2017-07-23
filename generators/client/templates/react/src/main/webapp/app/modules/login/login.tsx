import * as React from 'react';
import { connect } from 'react-redux';

import LoginModal from './login-modal';
import { login } from '../../reducers/authentication';

export interface ILoginProps {
  isAuthenticated: boolean;
  loginError?: boolean;
  login: Function;
}

export interface ILoginState {
  showModal: boolean;
}

export class Login extends React.Component<ILoginProps, ILoginState> {

  constructor(props) {
    super(props);
    this.state = {// eslint-disable-line immutable/no-mutation
      showModal: false
    };
  }

  componentWillMount() {
    this.setState({
      showModal: !this.props.isAuthenticated
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      showModal: !nextProps.isAuthenticated
    });
  }

  handleLogin = (username, password, rememberMe = false) => {
    this.props.login(username, password, rememberMe);
  }

  handleClose = () => {
    this.setState({ showModal: false });
  }

  render() {
    return (
      <LoginModal
        showModal={this.state.showModal}
        handleLogin={this.handleLogin}
        handleClose={this.handleClose}
        loginError={this.props.loginError}
      />
    );
  }
}

const mapStateToProps = storeState => ({
  isAuthenticated: storeState.authentication.isAuthenticated,
  loginError: storeState.authentication.loginError
});

const mapDispatchToProps = { login };

export default connect(mapStateToProps, mapDispatchToProps)(Login);
