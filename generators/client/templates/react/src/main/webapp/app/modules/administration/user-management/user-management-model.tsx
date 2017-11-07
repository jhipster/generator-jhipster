import * as React from 'react';
import { connect } from 'react-redux';

import { ICrudGetAction } from '../../../shared/model/redux-action.type';
import { getUsers } from '../../../reducers/user-management';

export interface IUserManagementProps {
  isFetching?: boolean;
  getUsers: ICrudGetAction;
  users: any[];
  account: any;
  match: any;
}
export class UserManagementModel extends React.Component<IUserManagementProps, undefined> {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.getUsers();
  }

  getUserList = () => {
    if (!this.props.isFetching) {
      this.props.getUsers();
    }
  }

  render() {
    // const { users, account, isFetching, match } = this.props;
    return (
      <div>
        Test
      </div>
    );
  }
}

const mapStateToProps = storeState => ({
  users: storeState.userManagement.users,
  account: storeState.authentication.account,
  isFetching: storeState.userManagement.isFetching
});

const mapDispatchToProps = { getUsers };

export default connect(mapStateToProps, mapDispatchToProps)(UserManagementModel);
