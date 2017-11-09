import './app.<%= styleSheetExt %>';

import * as React from 'react';
import { connect } from 'react-redux';
import { Card } from 'reactstrap';
import { HashRouter as Router } from 'react-router-dom';
import { ModalContainer } from 'react-router-modal';

import { getSession, logout } from './reducers/authentication';
<%_ if (enableTranslation) { _%>
import { setLocale } from './reducers/locale';
<%_ } _%>
import Header from './shared/layout/header/header';
import Footer from './shared/layout/footer/footer';
import AppRoutes from './routes';
export interface IAppProps {
  location: any;
  isAuthenticated?: boolean;
  <%_ if (enableTranslation) { _%>
  currentLocale: string;
  <%_ } _%>
  getSession: Function;
  <%_ if (enableTranslation) { _%>
  setLocale: Function;
  <%_ } _%>
  logout: Function;
  getSystemProperties: Function;
  routes: any;
}

export class App extends React.Component<IAppProps, {}> {
  componentDidMount() {
    this.props.getSession();
  }

  handleLogout = () => {
    this.props.logout();
  }

  render() {
    const paddingTop = '60px';
    return (
      <Router>
        <div className="app-container" style={{ paddingTop }}>
          <Header<% if (enableTranslation) { %>
            isAuthenticated={this.props.isAuthenticated}
            currentLocale={this.props.currentLocale}
            onLocaleChange={this.props.setLocale}
          <% } %>/>
          <div className="container-fluid view-container" id="app-view-container">
            <Card className="jh-card">
              <AppRoutes/>
            </Card>
            <Footer/>
          </div>
          <ModalContainer />
        </div>
      </Router>
    );
  }
}

const mapStateToProps = storeState => ({
  isAuthenticated: storeState.authentication.isAuthenticated,
  <%_ if (enableTranslation) { _%>
  currentLocale: storeState.locale.currentLocale,
  <%_ } _%>
  embedded: storeState.layout.embedded
});

const mapDispatchToProps = { getSession, <% if (enableTranslation) { %>setLocale, <% } %>logout };

export default connect(mapStateToProps, mapDispatchToProps)(App);
