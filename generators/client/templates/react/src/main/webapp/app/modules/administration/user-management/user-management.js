import React, { Component } from 'react';
import { connect } from 'react-redux';

import Translate from 'react-translate-component';
import { getUsers } from '../../../reducers/administration';

export class UserManagement extends Component {

  constructor(props) {
    super(props);
    this.getUserList = this.getUserList.bind(this);
  }

  componentDidMount() {
    this.props.getUsers();
  }

  getUserList() {
    if (!this.props.isFetching) {
      this.props.getUsers();
    }
  }

  render() {
    const { userManagement, isFetching } = this.props;
    const users = (userManagement && userManagement.users) ? userManagement.users : [];
    return (
      <div className="well">
        <div>
          <h2 data-translate="gateway.title">Users</h2>
          FIX ME datatable pagination, activate/deactivate, action buttons
          <p>
            <button type="button" onClick={() => this.getUserList()} className={isFetching ? 'btn btn-danger' : 'btn btn-primary'} disabled={isFetching}>
              <span className="glyphicon glyphicon-refresh glyphicon-" />&nbsp;
              <Translate component="span" content="gateway.refresh.button" />
            </button>
          </p>
        </div>
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr jh-sort="vm.predicate" ascending="vm.reverse" callback="vm.transition()">
                <th jh-sort-by="id"><span translate="global.field.id">ID</span><span className="glyphicon glyphicon-sort" /></th>
                <th jh-sort-by="login"><span translate="userManagement.login">Login</span> <span className="glyphicon glyphicon-sort" /></th>
                <th jh-sort-by="email"><span translate="userManagement.email">Email</span> <span className="glyphicon glyphicon-sort" /></th>
                <th />
                <th jh-sort-by="langKey"> <span translate="userManagement.langKey">Lang Key</span> <span className="glyphicon glyphicon-sort" /></th>                                    <th><span translate="userManagement.profiles">Profiles</span></th>                                    <th jh-sort-by="createdDate"><span translate="userManagement.createdDate">Created Date</span> <span className="glyphicon glyphicon-sort" /></th>
                <th jh-sort-by="lastModifiedBy"><span translate="userManagement.lastModifiedBy">Last Modified By</span> <span className="glyphicon glyphicon-sort" /></th>
                <th jh-sort-by="lastModifiedDate"><span translate="userManagement.lastModifiedDate">Last Modified Date</span> <span className="glyphicon glyphicon-sort" /></th>
                <th />
              </tr>
            </thead>
            <tbody>
              {
              users.map((user, i) => (
                <tr key={`user-${i}`}>
                  <td><a>{user.id}</a></td>
                  <td>{user.login}</td>
                  <td>{user.email}</td>
                  <td>
                    {
                      user.activated ? (
                        <span
                          className="label label-success" ng-click="vm.setActive(user, false)" ng-show="user.activated"
                          translate="userManagement.activated" style={{ cursor: 'pointer' }}
                        >Activated</span>
                      ) : (
                        <span
                          className="label label-danger" ng-click="vm.setActive(user, true)" ng-show="!user.activated"
                          translate="userManagement.deactivated" style={{ cursor: 'pointer' }}
                        >Deactivated</span>
                      )
                    }
                  </td>
                  <td>{user.langKey}</td>
                  <td>
                    {
                      users.authorities ? (
                      users.authorities.map((authority, i) => (
                        <div>
                          <span className="label label-info">{authority}</span>
                        </div>
                      ))) : null
                    }
                  </td>
                  <td>{user.createdDate}</td>
                  <td>{user.lastModifiedBy}</td>
                  <td>{user.lastModifiedDate}</td>
                  <td className="text-right">
                    <div className="btn-group flex-btn-group-container">
                      <button
                        type="submit"
                        className="btn btn-info btn-sm"
                      >
                        <span className="glyphicon glyphicon-eye-open" />
                        <span className="hidden-xs hidden-sm" ><Translate content="entity.action.view" /></span>
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary btn-sm"
                      >
                        <span className="glyphicon glyphicon-pencil" />
                        <span className="hidden-xs hidden-sm"><Translate content="entity.action.edit" /></span>
                      </button>
                      <button
                        type="submit"
                        className="btn btn-danger btn-sm" disabled={this.props.account.login === user.login}
                      >
                        <span className="glyphicon glyphicon-remove-circle" />
                        <span className="hidden-xs hidden-sm"><Translate content="entity.action.delete" /></span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            }
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default connect(
  (state => ({ userManagement: state.administration.userManagement, isFetching: state.administration.isFetching, account: state.authentication.account })),
  { getUsers }
)(UserManagement);
