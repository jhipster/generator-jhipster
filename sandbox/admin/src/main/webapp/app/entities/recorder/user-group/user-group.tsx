import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Col, Row, Table } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootState } from 'app/shared/reducers';
import { getEntities } from './user-group.reducer';
import { IUserGroup } from 'app/shared/model/recorder/user-group.model';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

export interface IUserGroupProps extends StateProps, DispatchProps, RouteComponentProps<{ url: string }> {}

export const UserGroup = (props: IUserGroupProps) => {
  useEffect(() => {
    props.getEntities();
  }, []);

  const handleSyncList = () => {
    props.getEntities();
  };

  const { userGroupList, match, loading } = props;
  return (
    <div>
      <h2 id="user-group-heading" data-cy="UserGroupHeading">
        <Translate contentKey="adminApp.recorderUserGroup.home.title">User Groups</Translate>
        <div className="d-flex justify-content-end">
          <Button className="mr-2" color="info" onClick={handleSyncList} disabled={loading}>
            <FontAwesomeIcon icon="sync" spin={loading} />{' '}
            <Translate contentKey="adminApp.recorderUserGroup.home.refreshListLabel">Refresh List</Translate>
          </Button>
          <Link to={`${match.url}/new`} className="btn btn-primary jh-create-entity" id="jh-create-entity" data-cy="entityCreateButton">
            <FontAwesomeIcon icon="plus" />
            &nbsp;
            <Translate contentKey="adminApp.recorderUserGroup.home.createLabel">Create new User Group</Translate>
          </Link>
        </div>
      </h2>
      <div className="table-responsive">
        {userGroupList && userGroupList.length > 0 ? (
          <Table responsive>
            <thead>
              <tr>
                <th>
                  <Translate contentKey="adminApp.recorderUserGroup.id">ID</Translate>
                </th>
                <th>
                  <Translate contentKey="adminApp.recorderUserGroup.name">Name</Translate>
                </th>
                <th>
                  <Translate contentKey="adminApp.recorderUserGroup.description">Description</Translate>
                </th>
                <th>
                  <Translate contentKey="adminApp.recorderUserGroup.userProfile">User Profile</Translate>
                </th>
                <th>
                  <Translate contentKey="adminApp.recorderUserGroup.machineLabel">Machine Label</Translate>
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {userGroupList.map((userGroup, i) => (
                <tr key={`entity-${i}`} data-cy="entityTable">
                  <td>
                    <Button tag={Link} to={`${match.url}/${userGroup.id}`} color="link" size="sm">
                      {userGroup.id}
                    </Button>
                  </td>
                  <td>{userGroup.name}</td>
                  <td>{userGroup.description}</td>
                  <td>
                    {userGroup.userProfiles
                      ? userGroup.userProfiles.map((val, j) => (
                          <span key={j}>
                            <Link to={`user-profile/${val.id}`}>{val.principal}</Link>
                            {j === userGroup.userProfiles.length - 1 ? '' : ', '}
                          </span>
                        ))
                      : null}
                  </td>
                  <td>
                    {userGroup.machineLabels
                      ? userGroup.machineLabels.map((val, j) => (
                          <span key={j}>
                            <Link to={`machine-label/${val.id}`}>{val.name}</Link>
                            {j === userGroup.machineLabels.length - 1 ? '' : ', '}
                          </span>
                        ))
                      : null}
                  </td>
                  <td className="text-right">
                    <div className="btn-group flex-btn-group-container">
                      <Button tag={Link} to={`${match.url}/${userGroup.id}`} color="info" size="sm" data-cy="entityDetailsButton">
                        <FontAwesomeIcon icon="eye" />{' '}
                        <span className="d-none d-md-inline">
                          <Translate contentKey="entity.action.view">View</Translate>
                        </span>
                      </Button>
                      <Button tag={Link} to={`${match.url}/${userGroup.id}/edit`} color="primary" size="sm" data-cy="entityEditButton">
                        <FontAwesomeIcon icon="pencil-alt" />{' '}
                        <span className="d-none d-md-inline">
                          <Translate contentKey="entity.action.edit">Edit</Translate>
                        </span>
                      </Button>
                      <Button tag={Link} to={`${match.url}/${userGroup.id}/delete`} color="danger" size="sm" data-cy="entityDeleteButton">
                        <FontAwesomeIcon icon="trash" />{' '}
                        <span className="d-none d-md-inline">
                          <Translate contentKey="entity.action.delete">Delete</Translate>
                        </span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          !loading && (
            <div className="alert alert-warning">
              <Translate contentKey="adminApp.recorderUserGroup.home.notFound">No User Groups found</Translate>
            </div>
          )
        )}
      </div>
    </div>
  );
};

const mapStateToProps = ({ userGroup }: IRootState) => ({
  userGroupList: userGroup.entities,
  loading: userGroup.loading,
});

const mapDispatchToProps = {
  getEntities,
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(UserGroup);
