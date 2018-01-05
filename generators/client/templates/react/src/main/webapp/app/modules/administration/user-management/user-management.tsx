<%#
Copyright 2013-2017 the original author or authors from the JHipster project.

This file is part of the JHipster project, see http://www.jhipster.tech/
for more information.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-%>
import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button } from 'reactstrap';
import { Pagination } from 'react-bootstrap';
import { Translate, ICrudGetAction, TextFormat } from 'react-jhipster';
import { FaPlus, FaEye, FaPencil, FaTrash } from 'react-icons/lib/fa';

import { getUsers } from '../../../reducers/user-management';
import { APP_DATE_FORMAT } from '../../../config/constants';
import { ITEMS_PER_PAGE } from '../../../shared/util/pagination.constants';

export interface IUserManagementProps {
  getUsers: ICrudGetAction;
  users: any[];
  account: any;
  match: any;
}

export interface IUserManagementState {
  itemsPerPage: number;
  items: number;
  sort: string;
  order: string;
  activePage: number;
  totalItems: number;
}

export class UserManagement extends React.Component<IUserManagementProps, IUserManagementState> {

  constructor(props) {
    super(props);
    this.state = {
      itemsPerPage: ITEMS_PER_PAGE,
      items: 0,
      sort: 'id',
      order: 'asc',
      activePage: 1,
      totalItems: 0
    };
  }

  componentDidMount() {
    this.props.getUsers().then((action) => { 
      this.setState({ 
        totalItems: action.value.headers['x-total-count'],
        items: Math.round(action.value.headers['x-total-count'] / this.state.itemsPerPage) + 1
      });
    });
  }

  sort(prop) {
    this.state.order === 'asc' ?
      this.setState({
        order: 'desc',
        sort: prop
    }, () => {
      this.sortUsers();
    }) :
    this.setState({
       order: 'asc',
       sort: prop
    }, () => {
      this.sortUsers();
    });
  }

  sortUsers() {
    this.props.getUsers(this.state.activePage - 1, this.state.itemsPerPage, this.state.sort + ',' + this.state.order);
  }

  getInitialState() {
    return {
      activePage: 1
    };
  }

  handleSelect(eventKey) {
    this.setState({
      activePage: eventKey
    }, () => {
      this.sortUsers();
    });
  }

  render() {
    const { users, account, match } = this.props;
    return (
      <div>
        <h2>
          <Translate contentKey="userManagement.home.title">Users</Translate>
          <Link to={`${match.url}/new`} className="btn btn-primary float-right jh-create-entity">
            <FaPlus /> <Translate contentKey="userManagement.home.createLabel" />
          </Link>
        </h2>
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th onClick={this.sort.bind(this, 'id')}><Translate contentKey="global.field.id">ID</Translate> <span className="fa fa-sort"/></th>
                <th onClick={this.sort.bind(this, 'login')}><Translate contentKey="userManagement.login">Login</Translate> <span className="fa fa-sort"/></th>
                <th onClick={this.sort.bind(this, 'email')}><Translate contentKey="userManagement.email">Email</Translate> <span className="fa fa-sort"/></th>
                <th />
                <%_ if (enableTranslation) { _%>
                <th onClick={this.sort.bind(this, 'langKey')}><Translate contentKey="userManagement.langKey">Lang Key</Translate> <span className="fa fa-sort"/></th>
                <%_ } _%>
                <th><Translate contentKey="userManagement.profiles">Profiles</Translate></th>
                <%_ if (databaseType !== 'cassandra') { _%>
                <th onClick={this.sort.bind(this, 'createdDate')}><Translate contentKey="userManagement.createdDate">Created Date</Translate> <span className="fa fa-sort"/></th>
                <th onClick={this.sort.bind(this, 'lastModifiedBy')}>
                  <Translate contentKey="userManagement.lastModifiedBy">Last Modified By</Translate> <span className="fa fa-sort"/>
                </th>
                <th onClick={this.sort.bind(this, 'lastModifiedDate')}>
                  <Translate contentKey="userManagement.lastModifiedDate">Last Modified Date</Translate> <span className="fa fa-sort"/>
                </th>
                <th />
                <%_ } _%>
              </tr>
            </thead>
            <tbody>
              {
              users.map((user, i) => (
                <tr key={`user-${i}`}>
                  <td>
                    <Button
                      tag={Link} to={`${match.url}/${user.login}`}
                      color="link" size="sm"
                    >
                      {user.id}
                    </Button>
                  </td>
                  <td>{user.login}</td>
                  <td>{user.email}</td>
                  <td>
                    {
                      user.activated ? (
                        <span className="badge badge-success" style={{ cursor: 'pointer' }}>Activated</span>
                      ) : (
                        <span className="badge badge-danger" style={{ cursor: 'pointer' }}>Deactivated</span>
                      )
                    }
                  </td>
                  <%_ if (enableTranslation) { _%>
                  <td>{user.langKey}</td>
                  <%_ } _%>
                  <td>
                    {
                      user.authorities ? (
                      user.authorities.map((authority, j) => (
                        <div key={`user-auth-${i}-${j}`}>
                          <span className="badge badge-info">{authority}</span>
                        </div>
                      ))) : null
                    }
                  </td>
                  <%_ if (databaseType !== 'cassandra') { _%>
                  <td><TextFormat value={user.createdDate} type="date" format={APP_DATE_FORMAT} blankOnInvalid /></td>
                  <td>{user.lastModifiedBy}</td>
                  <td><TextFormat value={user.lastModifiedDate} type="date" format={APP_DATE_FORMAT} blankOnInvalid /></td>
                  <%_ } _%>
                  <td className="text-right">
                    <div className="btn-group flex-btn-group-container">
                      <Button
                        tag={Link} to={`${match.url}/${user.login}`}
                        color="info" size="sm"
                      >
                        <FaEye/> <span className="d-none d-md-inline" ><Translate contentKey="entity.action.view" /></span>
                      </Button>
                      <Button
                        tag={Link} to={`${match.url}/${user.login}/edit`}
                        color="primary" size="sm"
                      >
                        <FaPencil/> <span className="d-none d-md-inline"><Translate contentKey="entity.action.edit" /></span>
                      </Button>
                      <Button
                        tag={Link} to={`${match.url}/${user.login}/delete`}
                        color="danger" size="sm" disabled={account.login === user.login}
                      >
                        <FaTrash/> <span className="d-none d-md-inline"><Translate contentKey="entity.action.delete" /></span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            }
            </tbody>
          </table>
        </div>
        <div className="row justify-content-center">
          <Pagination 
            prev next first last ellipsis boundaryLinks
            items={this.state.items}
            maxButtons={5}
            activePage={this.state.activePage}
            onSelect={this.handleSelect.bind(this)}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = storeState => ({
  users: storeState.userManagement.users,
  account: storeState.authentication.account
});

const mapDispatchToProps = { getUsers };

export default connect(mapStateToProps, mapDispatchToProps)(UserManagement);
