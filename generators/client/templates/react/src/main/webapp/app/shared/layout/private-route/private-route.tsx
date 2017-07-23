import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { redirectToLoginWithMessage, getSession } from '../../../reducers/authentication';

const mapStoreToProps = store => ({
  loading: store.authentication.loading,
  isAuthenticated: store.authentication.isAuthenticated
});
const mapDispatchToProps = {
  redirectToLoginWithMessage,
  getSession
};

export interface IPrivateRouteProps {
  getSession: Function;
  // redirectToLoginWithMessage: Function;
  loading: boolean;
  isAuthenticated: boolean;
}
const PrivateRoute = Wrapped => connect(
  mapStoreToProps, mapDispatchToProps
  )(class extends React.Component<IPrivateRouteProps, undefined> {

  componentDidMount() {
    this.props.getSession();
    // this.redirectIfNotLogged(this.props);
  }

  componentWillReceiveProps(nextProps) {
    // this.redirectIfNotLogged(nextProps);
  }

  // redirectIfNotLogged(props) {
  //   const { loading, isAuthenticated } = props;
  //   if (loading === false && !isAuthenticated) {
  //     // TODO fix issue with authentication redirect
  //     this.props.redirectToLoginWithMessage('login.messages.error.authentication');
  //   }
  // }

  render() {
    const { loading, isAuthenticated } = this.props;
    if (loading && !isAuthenticated) {
      return (
        <div className="center un-authorized pad-10">
          <div>Loading...</div>
          <div>You are not authorized to view this page... <Link to="/login" className="alert-link">sign in</Link></div>
        </div>
      );
    }

    return <Wrapped {...this.props} />;
  }
});

export default PrivateRoute;
