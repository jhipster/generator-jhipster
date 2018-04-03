import * as React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Translate } from 'react-jhipster';

export interface IPrivateRouteProps {
  component: any;
  isAuthenticated: boolean;
  isAuthorized: boolean;
  hasAnyAuthorities?: string[];
  [key: string]: any;
}

export const PrivateRouteComponent = ({
  component: Component,
  isAuthenticated,
  isAuthorized,
  hasAnyAuthorities = [],
  ...rest
}: IPrivateRouteProps) => {
  const checkAuthorities = props =>
    isAuthorized ? (
      <Component {...props} />
    ) : (
      <div className="insufficient-authority">
        <div className="alert alert-danger">
          <Translate contentKey="error.http.403">You are not authorized to access this page.</Translate>
        </div>
      </div>
    );

  const renderRedirect = props =>
    isAuthenticated ? (
      checkAuthorities(props)
    ) : (
      <Redirect
        to={{
          pathname: '/login',
          search: props.location.search,
          state: { from: props.location }
        }}
      />
    );

  if (!Component) throw new Error(`A component needs to be specified for private route for path ${(rest as any).path}`);

  return <Route {...rest} render={renderRedirect} />;
};

export const hasAnyAuthority = (authorities: string[], hasAnyAuthorities: string[]) => {
  if (authorities && authorities.length !== 0) {
    if (hasAnyAuthorities.length === 0) {
      return true;
    }
    return hasAnyAuthorities.some(auth => authorities.includes(auth));
  }
  return false;
};

const mapStoreToProps = ({ authentication: { isAuthenticated, account } }, { hasAnyAuthorities = [] }) => ({
  isAuthenticated,
  isAuthorized: hasAnyAuthority(account.authorities, hasAnyAuthorities)
});

/**
 * A route wrapped in an authentication check so that routing happens only when you are authenticated.
 * Accepts same props as React router Route.
 * The route also checks for authorization if hasAnyAuthorities is specified.
 */
export const PrivateRoute = connect(mapStoreToProps, null, null, { pure: false })(PrivateRouteComponent);

export default PrivateRoute;
