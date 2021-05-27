import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, Label } from 'reactstrap';
import { AvFeedback, AvForm, AvGroup, AvInput, AvField } from 'availity-reactstrap-validation';
import { Translate, translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootState } from 'app/shared/reducers';

import { IUserProfile } from 'app/shared/model/recorder/user-profile.model';
import { getEntities as getUserProfiles } from 'app/entities/recorder/user-profile/user-profile.reducer';
import { IMachineLabel } from 'app/shared/model/recorder/machine-label.model';
import { getEntities as getMachineLabels } from 'app/entities/recorder/machine-label/machine-label.reducer';
import { getEntity, updateEntity, createEntity, reset } from './user-group.reducer';
import { IUserGroup } from 'app/shared/model/recorder/user-group.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface IUserGroupUpdateProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export const UserGroupUpdate = (props: IUserGroupUpdateProps) => {
  const [idsuserProfile, setIdsuserProfile] = useState([]);
  const [idsmachineLabel, setIdsmachineLabel] = useState([]);
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const { userGroupEntity, userProfiles, machineLabels, loading, updating } = props;

  const handleClose = () => {
    props.history.push('/user-group');
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getUserProfiles();
    props.getMachineLabels();
  }, []);

  useEffect(() => {
    if (props.updateSuccess) {
      handleClose();
    }
  }, [props.updateSuccess]);

  const saveEntity = (event, errors, values) => {
    if (errors.length === 0) {
      const entity = {
        ...userGroupEntity,
        ...values,
        userProfiles: mapIdList(values.userProfiles),
        machineLabels: mapIdList(values.machineLabels),
      };

      if (isNew) {
        props.createEntity(entity);
      } else {
        props.updateEntity(entity);
      }
    }
  };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="adminApp.recorderUserGroup.home.createOrEditLabel" data-cy="UserGroupCreateUpdateHeading">
            <Translate contentKey="adminApp.recorderUserGroup.home.createOrEditLabel">Create or edit a UserGroup</Translate>
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <AvForm model={isNew ? {} : userGroupEntity} onSubmit={saveEntity}>
              {!isNew ? (
                <AvGroup>
                  <Label for="user-group-id">
                    <Translate contentKey="global.field.id">ID</Translate>
                  </Label>
                  <AvInput id="user-group-id" type="text" className="form-control" name="id" required readOnly />
                </AvGroup>
              ) : null}
              <AvGroup>
                <Label id="nameLabel" for="user-group-name">
                  <Translate contentKey="adminApp.recorderUserGroup.name">Name</Translate>
                </Label>
                <AvField
                  id="user-group-name"
                  data-cy="name"
                  type="text"
                  name="name"
                  validate={{
                    required: { value: true, errorMessage: translate('entity.validation.required') },
                  }}
                />
              </AvGroup>
              <AvGroup>
                <Label id="descriptionLabel" for="user-group-description">
                  <Translate contentKey="adminApp.recorderUserGroup.description">Description</Translate>
                </Label>
                <AvField id="user-group-description" data-cy="description" type="text" name="description" />
              </AvGroup>
              <AvGroup>
                <Label for="user-group-userProfile">
                  <Translate contentKey="adminApp.recorderUserGroup.userProfile">User Profile</Translate>
                </Label>
                <AvInput
                  id="user-group-userProfile"
                  data-cy="userProfile"
                  type="select"
                  multiple
                  className="form-control"
                  name="userProfiles"
                  value={!isNew && userGroupEntity.userProfiles && userGroupEntity.userProfiles.map(e => e.id)}
                >
                  <option value="" key="0" />
                  {userProfiles
                    ? userProfiles.map(otherEntity => (
                        <option value={otherEntity.id} key={otherEntity.id}>
                          {otherEntity.principal}
                        </option>
                      ))
                    : null}
                </AvInput>
              </AvGroup>
              <AvGroup>
                <Label for="user-group-machineLabel">
                  <Translate contentKey="adminApp.recorderUserGroup.machineLabel">Machine Label</Translate>
                </Label>
                <AvInput
                  id="user-group-machineLabel"
                  data-cy="machineLabel"
                  type="select"
                  multiple
                  className="form-control"
                  name="machineLabels"
                  value={!isNew && userGroupEntity.machineLabels && userGroupEntity.machineLabels.map(e => e.id)}
                >
                  <option value="" key="0" />
                  {machineLabels
                    ? machineLabels.map(otherEntity => (
                        <option value={otherEntity.id} key={otherEntity.id}>
                          {otherEntity.name}
                        </option>
                      ))
                    : null}
                </AvInput>
              </AvGroup>
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/user-group" replace color="info">
                <FontAwesomeIcon icon="arrow-left" />
                &nbsp;
                <span className="d-none d-md-inline">
                  <Translate contentKey="entity.action.back">Back</Translate>
                </span>
              </Button>
              &nbsp;
              <Button color="primary" id="save-entity" data-cy="entityCreateSaveButton" type="submit" disabled={updating}>
                <FontAwesomeIcon icon="save" />
                &nbsp;
                <Translate contentKey="entity.action.save">Save</Translate>
              </Button>
            </AvForm>
          )}
        </Col>
      </Row>
    </div>
  );
};

const mapStateToProps = (storeState: IRootState) => ({
  userProfiles: storeState.userProfile.entities,
  machineLabels: storeState.machineLabel.entities,
  userGroupEntity: storeState.userGroup.entity,
  loading: storeState.userGroup.loading,
  updating: storeState.userGroup.updating,
  updateSuccess: storeState.userGroup.updateSuccess,
});

const mapDispatchToProps = {
  getUserProfiles,
  getMachineLabels,
  getEntity,
  updateEntity,
  createEntity,
  reset,
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(UserGroupUpdate);
