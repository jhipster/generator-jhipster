import './app.scss';

import * as React from 'react';
import { connect } from 'react-redux';
import { isUndefined } from 'lodash';

import { getSession, logout } from './reducers/authentication';
import { setLocale } from './reducers/locale';
import { setEmbeddedMode } from './reducers/layout';
import { getSystemProperties } from './reducers/system-property';
import Header from './shared/layout/header/header';
import appConfig from './config/constants';

export interface IAppProps {
  location: any;
  isAuthenticated?: boolean;
  currentLocale: string;
  getSession: Function;
  setLocale: Function;
  logout: Function;
  getSystemProperties: Function;
  children: any;
}

export class App extends React.Component<IAppProps, {}> {

  componentDidMount() {
    this.props.getSession();
  }

  handleLogout = () => {
    this.props.logout();
  }

  render() {
    return (
      <div className={`app-container`}>
        <div className="main-container" id="main-container">
          <Header
            currentLocale={this.props.currentLocale}
            onLocaleChange={this.props.setLocale}
          />
          <div className="view-container container-fluid no-padding">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = storeState => ({
  isAuthenticated: storeState.authentication.isAuthenticated,
  currentLocale: storeState.locale.currentLocale,
  embedded: storeState.layout.embedded
});

const mapDispatchToProps = { getSession, setLocale, logout, setEmbeddedMode, getSystemProperties };

export default connect(mapStateToProps, mapDispatchToProps)(App);
