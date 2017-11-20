import * as React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';

export interface IPrivateRouteProps {
  component: React.ComponentClass<any> | React.StatelessComponent<any>;
  isAuthenticated: boolean;
}

const PrivateRoute = ({ component: Component, isAuthenticated, ...rest }: IPrivateRouteProps) => {
  const renderRedirect = props => (
    isAuthenticated
      ? <Component {...props} />
      : (
        <Redirect to={{
          pathname: '/login',
          search: props.location.search,
          state: { from: props.location }
        }} />
      )
  );
  return <Route {...rest} render={renderRedirect} />;
};

const mapStoreToProps = store => ({
  isAuthenticated: store.authentication.isAuthenticated
});

export default connect(mapStoreToProps, null, null, { pure: false })(PrivateRoute);
