import 'flexboxgrid/dist/flexboxgrid.css';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import { locales } from './config/translation';
import appTheme from './config/theme';
import { setLocale } from './reducers/locale';
import { getSession, logout } from './reducers/authentication';
import Header from './shared/components/header/header';
import Footer from './shared/components/footer/footer';

import './app.scss';

export class App extends Component {
  static propTypes = {
    isAuthenticated: PropTypes.bool,
    currentLocale: PropTypes.string.isRequired,
    getSession: PropTypes.func.isRequired,
    setLocale: PropTypes.func.isRequired,
    logout: PropTypes.func.isRequired,
    children: PropTypes.node
  };

  static defaultProps = {
    isAuthenticated: false,
    children: null
  };

  constructor(props) {
    super(props);
    this.handleLogout = this.handleLogout.bind(this);
  }

  componentDidMount() {
    this.props.getSession();
  }

  handleLogout() {
    this.props.logout();
  }

  render() {
    return (
      <MuiThemeProvider muiTheme={appTheme}>
        <div className="main-container" id="main-container">
          <Header
            currentLocale={this.props.currentLocale}
            onLocaleChange={this.props.setLocale}
            isAuthenticated={this.props.isAuthenticated}
            handleLogout={this.handleLogout}
            toggleSideBar={this.toggleSideBar}
          />
          <div className="container">
            {this.props.children}
          </div>
          <Footer />
        </div>
      </MuiThemeProvider>
    );
  }
}

export default connect(
  store => ({ isAuthenticated: store.authentication.isAuthenticated, currentLocale: store.locale.currentLocale }),
  { getSession, setLocale, logout }
)(App);
