import * as React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import LoginModal from './login-modal';
import { login } from '../../reducers/authentication';

export interface ILoginProps {
  isAuthenticated: boolean;
  showModal: boolean;
  loginError?: boolean;
  location: any;
  login: Function;
}

export interface ILoginState {
  showModal: boolean;
  redirectToReferrer: boolean;
}

export class Login extends React.Component<ILoginProps, ILoginState> {

  constructor(props) {
    super(props);
    this.state = {
      showModal: props.showModal,
      redirectToReferrer: props.isAuthenticated
    };
  }

  componentWillReceiveProps(nextProps: ILoginProps) {
    this.setState({
      showModal: nextProps.showModal,
      redirectToReferrer: nextProps.isAuthenticated
    });
  }

  handleLogin = (username, password, rememberMe = false) => {
    this.props.login(username, password, rememberMe);
  }

  handleClose = () => {
    this.setState({ showModal: false });
  }

  render() {
    const { from } = this.props.location.state || { from: { pathname: '/', search: this.props.location.search } };
    const { showModal, redirectToReferrer } = this.state;
    if (redirectToReferrer) {
      return <Redirect to={from} />;
    }
    return (
      <LoginModal
        showModal={showModal}
        handleLogin={this.handleLogin}
        handleClose={this.handleClose}
        loginError={this.props.loginError}
      />
    );
  }
}

const mapStateToProps = ({ authentication }) => ({
  isAuthenticated: authentication.isAuthenticated,
  loginError: authentication.loginError,
  showModal: authentication.showModalLogin
});

const mapDispatchToProps = { login };

export default connect(mapStateToProps, mapDispatchToProps)(Login);
