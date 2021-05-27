import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootState } from 'app/shared/reducers';
import { getEntity } from './user-group.reducer';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

export interface IUserGroupDetailProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export const UserGroupDetail = (props: IUserGroupDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const { userGroupEntity } = props;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="userGroupDetailsHeading">
          <Translate contentKey="adminApp.recorderUserGroup.detail.title">UserGroup</Translate>
        </h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">
              <Translate contentKey="global.field.id">ID</Translate>
            </span>
          </dt>
          <dd>{userGroupEntity.id}</dd>
          <dt>
            <span id="name">
              <Translate contentKey="adminApp.recorderUserGroup.name">Name</Translate>
            </span>
          </dt>
          <dd>{userGroupEntity.name}</dd>
          <dt>
            <span id="description">
              <Translate contentKey="adminApp.recorderUserGroup.description">Description</Translate>
            </span>
          </dt>
          <dd>{userGroupEntity.description}</dd>
          <dt>
            <Translate contentKey="adminApp.recorderUserGroup.userProfile">User Profile</Translate>
          </dt>
          <dd>
            {userGroupEntity.userProfiles
              ? userGroupEntity.userProfiles.map((val, i) => (
                  <span key={val.id}>
                    <a>{val.principal}</a>
                    {userGroupEntity.userProfiles && i === userGroupEntity.userProfiles.length - 1 ? '' : ', '}
                  </span>
                ))
              : null}
          </dd>
          <dt>
            <Translate contentKey="adminApp.recorderUserGroup.machineLabel">Machine Label</Translate>
          </dt>
          <dd>
            {userGroupEntity.machineLabels
              ? userGroupEntity.machineLabels.map((val, i) => (
                  <span key={val.id}>
                    <a>{val.name}</a>
                    {userGroupEntity.machineLabels && i === userGroupEntity.machineLabels.length - 1 ? '' : ', '}
                  </span>
                ))
              : null}
          </dd>
        </dl>
        <Button tag={Link} to="/user-group" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" />{' '}
          <span className="d-none d-md-inline">
            <Translate contentKey="entity.action.back">Back</Translate>
          </span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/user-group/${userGroupEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" />{' '}
          <span className="d-none d-md-inline">
            <Translate contentKey="entity.action.edit">Edit</Translate>
          </span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStateToProps = ({ userGroup }: IRootState) => ({
  userGroupEntity: userGroup.entity,
});

const mapDispatchToProps = { getEntity };

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(UserGroupDetail);
