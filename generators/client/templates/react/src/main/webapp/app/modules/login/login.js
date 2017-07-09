import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';

import LoginModal from './login-modal';
import { login } from '../../reducers/authentication';

export class Login extends Component {

  static propTypes = {
    login: PropTypes.func.isRequired,
    isAuthenticated: PropTypes.bool.isRequired
  };

  constructor(props) {
    super(props);
    this.handleLogin = this.handleLogin.bind(this);
    this.state = {
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

  handleLogin(username, password, rememberMe = false) {
    this.props.login(username, password, rememberMe);
  }

  handleClose = () => {
    this.setState({ showModal: false });
  };

  render() {
    return (
      <LoginModal showModal={this.state.showModal} handleLogin={this.handleLogin} handleClose={this.handleClose} />
    );
  }
}

export default connect(
  store => ({ account: store.authentication.account, isAuthenticated: store.authentication.isAuthenticated }),
  { login }
)(Login);
