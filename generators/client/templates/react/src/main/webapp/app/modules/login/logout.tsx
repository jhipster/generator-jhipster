import * as React from 'react';
import { connect } from 'react-redux';

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
      </div>
    );
  }
}

const mapStateToProps = storeState => ({});

const mapDispatchToProps = { logout };

export default connect(mapStateToProps, mapDispatchToProps)(Logout);
