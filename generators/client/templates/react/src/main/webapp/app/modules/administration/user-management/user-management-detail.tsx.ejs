import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button } from 'reactstrap';
import { Translate, ICrudGetAction, TextFormat } from 'react-jhipster';
import { FaArrowLeft } from 'react-icons/lib/fa';

import { getUser } from '../../../reducers/user-management';
import { APP_DATE_FORMAT } from '../../../config/constants';

export interface IUserManagementDetailProps {
  getUser: ICrudGetAction;
  user: any;
  match: any;
}
export class UserManagementDetail extends React.Component<IUserManagementDetailProps, undefined> {

  componentDidMount() {
    this.props.getUser(this.props.match.params.login);
  }

  render() {
    const { user } = this.props;
    return (
      <div>
        <h2>
          <Translate contentKey="userManagement.detail.title">User</Translate> [<b>{user.login}</b>]
        </h2>
        <dl className="row-md jh-entity-details">
          <dt><Translate contentKey="userManagement.login">Login</Translate></dt>
          <dd>
            <span>{user.login}</span>&nbsp;
            {
              user.activated ? (
                <span className="badge badge-success"><Translate contentKey="userManagement.activated">Activated</Translate></span>
              ) : (
                <span className="badge badge-danger"><Translate contentKey="userManagement.deactivated">Deactivated</Translate></span>
              )
            }
          </dd>
          <dt><Translate contentKey="userManagement.firstName">First Name</Translate></dt>
          <dd>{user.firstName}</dd>
          <dt><Translate contentKey="userManagement.lastName">Last Name</Translate></dt>
          <dd>{user.lastName}</dd>
          <dt><Translate contentKey="userManagement.email">Email</Translate></dt>
          <dd>{user.email}</dd>
          <%_ if (enableTranslation) { _%>
          <dt><Translate contentKey="userManagement.langKey">Lang Key</Translate></dt>
          <dd>{user.langKey}</dd>
          <%_ } _%>
          <dt><Translate contentKey="userManagement.createdBy">Created By</Translate></dt>
          <dd>{user.createdBy}</dd>
          <dt><Translate contentKey="userManagement.createdDate">Created Date</Translate></dt>
          <dd><TextFormat value={user.createdDate} type="date" format={APP_DATE_FORMAT} blankOnInvalid /></dd>
          <dt><Translate contentKey="userManagement.lastModifiedBy">Last Modified By</Translate></dt>
          <dd>{user.lastModifiedBy}</dd>
          <dt><Translate contentKey="userManagement.lastModifiedDate">Last Modified Date</Translate></dt>
          <dd><TextFormat value={user.lastModifiedDate} type="date" format={APP_DATE_FORMAT} blankOnInvalid /></dd>
          <dt><Translate contentKey="userManagement.profiles">Profiles</Translate></dt>
          <dd>
            <ul className="list-unstyled">
              {
                user.authorities ? (
                user.authorities.map((authority, i) => (
                  <li key={`user-auth-${i}`}>
                    <span className="badge badge-info">{authority}</span>
                  </li>
                ))) : null
              }
            </ul>
          </dd>
        </dl>
        <Button
          tag={Link} to="/admin/user-management" replace
          color="info"
        >
          <FaArrowLeft/> <span className="d-none d-md-inline" ><Translate contentKey="entity.action.back">Back</Translate></span>
        </Button>
      </div>
    );
  }
}

const mapStateToProps = storeState => ({
  user: storeState.userManagement.user
});

const mapDispatchToProps = { getUser };

export default connect(mapStateToProps, mapDispatchToProps)(UserManagementDetail);
