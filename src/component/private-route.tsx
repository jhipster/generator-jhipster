import * as React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';

export interface IPrivateRouteProps {
  component: React.ComponentClass<any> | React.StatelessComponent<any>;
  isAuthenticated: boolean;
  [key: string]: any;
}

export const PrivateRouteComponent = ({ component: Component, isAuthenticated, ...rest }: IPrivateRouteProps) => {
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
  if (!Component) throw new Error(`A component needs to be specified for private route for path ${(rest as any).path}`);

  return <Route {...rest} render={renderRedirect} />;
};

const mapStoreToProps = ({ authentication }) => ({
  isAuthenticated: authentication.isAuthenticated
});

/**
 * A route wrapped in an authentication check so that routing happens only when you are authenticated.
 * Accepts same props as React router Route.
 */
export const PrivateRoute = connect(mapStoreToProps, null, null, { pure: false })(PrivateRouteComponent);
