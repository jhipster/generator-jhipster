<%#
Copyright 2013-2018 the original author or authors from the JHipster project.

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
import {
  Translate,
  ICrudGetAction,
  TextFormat,
  JhiPagination,
  getPaginationItemsNumber,
  getSortState,
  IPaginationState
} from 'react-jhipster';
import { FaPlus, FaEye, FaPencil, FaSort, FaTrash } from 'react-icons/lib/fa';

import { getUsers } from '../../../reducers/user-management';
import { APP_DATE_FORMAT } from '../../../config/constants';
import { ITEMS_PER_PAGE } from '../../../shared/util/pagination.constants';

export interface IUserManagementProps {
  getUsers: ICrudGetAction;
  users: any[];
  account: any;
  match: any;
  totalItems: 0;
  history: any;
  location: any;
}

export class UserManagement extends React.Component<IUserManagementProps, IPaginationState> {

  constructor(props) {
    super(props);
    this.state = {
      ...getSortState(props.location, ITEMS_PER_PAGE)
    };
  }

  componentDidMount() {
    this.getUsers();
  }

  sort = prop => () => {
    this.setState({
      order: this.state.order === 'asc' ? 'desc' : 'asc',
      sort: prop
    }, () => this.sortUsers());
  }

  sortUsers() {
    this.getUsers();
    this.props.history.push(`${this.props.location.pathname}?page=${this.state.activePage}&sort=${this.state.sort},${this.state.order}`);
  }

  handlePagination = activePage => this.setState({ activePage }, () => this.sortUsers());

  getUsers = () => {
    const { activePage, itemsPerPage, sort, order } = this.state;
    this.props.getUsers(activePage - 1, itemsPerPage, `${sort},${order}`);
  }

  render() {
    const { users, account, match, totalItems } = this.props;
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
                <th onClick={this.sort('id')}><Translate contentKey="global.field.id">ID</Translate><FaSort/></th>
                <th onClick={this.sort('login')}><Translate contentKey="userManagement.login">Login</Translate><FaSort/></th>
                <th onClick={this.sort('email')}><Translate contentKey="userManagement.email">Email</Translate><FaSort/></th>
                <th />
                <%_ if (enableTranslation) { _%>
                <th onClick={this.sort('langKey')}><Translate contentKey="userManagement.langKey">Lang Key</Translate><FaSort/></th>
                <%_ } _%>
                <th><Translate contentKey="userManagement.profiles">Profiles</Translate></th>
                <%_ if (databaseType !== 'cassandra') { _%>
                <th onClick={this.sort('createdDate')}><Translate contentKey="userManagement.createdDate">Created Date</Translate><FaSort/></th>
                <th onClick={this.sort('lastModifiedBy')}>
                  <Translate contentKey="userManagement.lastModifiedBy">Last Modified By</Translate><FaSort/>
                </th>
                <th onClick={this.sort('lastModifiedDate')}>
                  <Translate contentKey="userManagement.lastModifiedDate">Last Modified Date</Translate><FaSort/>
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
          <JhiPagination
            items={getPaginationItemsNumber(totalItems, this.state.itemsPerPage)}
            activePage={this.state.activePage}
            onSelect={this.handlePagination}
            maxButtons={5}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = storeState => ({
  users: storeState.userManagement.users,
  totalItems: storeState.userManagement.totalItems,
  account: storeState.authentication.account
});

const mapDispatchToProps = { getUsers };

export default connect(mapStateToProps, mapDispatchToProps)(UserManagement);
