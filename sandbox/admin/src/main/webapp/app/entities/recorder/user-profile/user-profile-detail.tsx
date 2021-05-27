import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootState } from 'app/shared/reducers';
import { getEntity } from './user-profile.reducer';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

export interface IUserProfileDetailProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export const UserProfileDetail = (props: IUserProfileDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const { userProfileEntity } = props;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="userProfileDetailsHeading">
          <Translate contentKey="adminApp.recorderUserProfile.detail.title">UserProfile</Translate>
        </h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">
              <Translate contentKey="global.field.id">ID</Translate>
            </span>
          </dt>
          <dd>{userProfileEntity.id}</dd>
          <dt>
            <span id="principal">
              <Translate contentKey="adminApp.recorderUserProfile.principal">Principal</Translate>
            </span>
          </dt>
          <dd>{userProfileEntity.principal}</dd>
          <dt>
            <Translate contentKey="adminApp.recorderUserProfile.actualNode">Actual Node</Translate>
          </dt>
          <dd>{userProfileEntity.actualNode ? userProfileEntity.actualNode.name : ''}</dd>
          <dt>
            <Translate contentKey="adminApp.recorderUserProfile.assignedNodes">Assigned Nodes</Translate>
          </dt>
          <dd>
            {userProfileEntity.assignedNodes
              ? userProfileEntity.assignedNodes.map((val, i) => (
                  <span key={val.id}>
                    <a>{val.name}</a>
                    {userProfileEntity.assignedNodes && i === userProfileEntity.assignedNodes.length - 1 ? '' : ', '}
                  </span>
                ))
              : null}
          </dd>
          <dt>
            <Translate contentKey="adminApp.recorderUserProfile.assignedCategories">Assigned Categories</Translate>
          </dt>
          <dd>
            {userProfileEntity.assignedCategories
              ? userProfileEntity.assignedCategories.map((val, i) => (
                  <span key={val.id}>
                    <a>{val.name}</a>
                    {userProfileEntity.assignedCategories && i === userProfileEntity.assignedCategories.length - 1 ? '' : ', '}
                  </span>
                ))
              : null}
          </dd>
          <dt>
            <Translate contentKey="adminApp.recorderUserProfile.machineLabel">Machine Label</Translate>
          </dt>
          <dd>
            {userProfileEntity.machineLabels
              ? userProfileEntity.machineLabels.map((val, i) => (
                  <span key={val.id}>
                    <a>{val.name}</a>
                    {userProfileEntity.machineLabels && i === userProfileEntity.machineLabels.length - 1 ? '' : ', '}
                  </span>
                ))
              : null}
          </dd>
        </dl>
        <Button tag={Link} to="/user-profile" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" />{' '}
          <span className="d-none d-md-inline">
            <Translate contentKey="entity.action.back">Back</Translate>
          </span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/user-profile/${userProfileEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" />{' '}
          <span className="d-none d-md-inline">
            <Translate contentKey="entity.action.edit">Edit</Translate>
          </span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStateToProps = ({ userProfile }: IRootState) => ({
  userProfileEntity: userProfile.entity,
});

const mapDispatchToProps = { getEntity };

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(UserProfileDetail);
