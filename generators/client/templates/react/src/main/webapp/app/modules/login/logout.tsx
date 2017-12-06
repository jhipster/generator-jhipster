import * as React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { logout } from '../../reducers/authentication';

export interface ILogoutProps {
  logout: Function;
}

export class Logout extends React.Component<ILogoutProps, undefined> {

  componentWillMount() {
    this.props.logout();
  }

  render() {
    return (
      <div className="p-5">
        <h4>Logged out succesfully!</h4>
        <Redirect to={{
          pathname: '/'
        }} />
      </div>
    );
  }
}

const mapStateToProps = storeState => ({});

const mapDispatchToProps = { logout };

export default connect(mapStateToProps, mapDispatchToProps)(Logout);
