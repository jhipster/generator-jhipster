import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, Label } from 'reactstrap';
import { AvFeedback, AvForm, AvGroup, AvInput, AvField } from 'availity-reactstrap-validation';
import { Translate, translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootState } from 'app/shared/reducers';

import { INode } from 'app/shared/model/recorder/node.model';
import { getEntities as getNodes } from 'app/entities/recorder/node/node.reducer';
import { ICategoryLabel } from 'app/shared/model/recorder/category-label.model';
import { getEntities as getCategoryLabels } from 'app/entities/recorder/category-label/category-label.reducer';
import { IMachineLabel } from 'app/shared/model/recorder/machine-label.model';
import { getEntities as getMachineLabels } from 'app/entities/recorder/machine-label/machine-label.reducer';
import { IUserGroup } from 'app/shared/model/recorder/user-group.model';
import { getEntities as getUserGroups } from 'app/entities/recorder/user-group/user-group.reducer';
import { getEntity, updateEntity, createEntity, reset } from './user-profile.reducer';
import { IUserProfile } from 'app/shared/model/recorder/user-profile.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface IUserProfileUpdateProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export const UserProfileUpdate = (props: IUserProfileUpdateProps) => {
  const [idsassignedNodes, setIdsassignedNodes] = useState([]);
  const [idsassignedCategories, setIdsassignedCategories] = useState([]);
  const [idsmachineLabel, setIdsmachineLabel] = useState([]);
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const { userProfileEntity, nodes, categoryLabels, machineLabels, userGroups, loading, updating } = props;

  const handleClose = () => {
    props.history.push('/user-profile');
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getNodes();
    props.getCategoryLabels();
    props.getMachineLabels();
    props.getUserGroups();
  }, []);

  useEffect(() => {
    if (props.updateSuccess) {
      handleClose();
    }
  }, [props.updateSuccess]);

  const saveEntity = (event, errors, values) => {
    if (errors.length === 0) {
      const entity = {
        ...userProfileEntity,
        ...values,
        assignedNodes: mapIdList(values.assignedNodes),
        assignedCategories: mapIdList(values.assignedCategories),
        machineLabels: mapIdList(values.machineLabels),
        actualNode: nodes.find(it => it.id.toString() === values.actualNodeId.toString()),
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
          <h2 id="adminApp.recorderUserProfile.home.createOrEditLabel" data-cy="UserProfileCreateUpdateHeading">
            <Translate contentKey="adminApp.recorderUserProfile.home.createOrEditLabel">Create or edit a UserProfile</Translate>
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <AvForm model={isNew ? {} : userProfileEntity} onSubmit={saveEntity}>
              {!isNew ? (
                <AvGroup>
                  <Label for="user-profile-id">
                    <Translate contentKey="global.field.id">ID</Translate>
                  </Label>
                  <AvInput id="user-profile-id" type="text" className="form-control" name="id" required readOnly />
                </AvGroup>
              ) : null}
              <AvGroup>
                <Label id="principalLabel" for="user-profile-principal">
                  <Translate contentKey="adminApp.recorderUserProfile.principal">Principal</Translate>
                </Label>
                <AvField
                  id="user-profile-principal"
                  data-cy="principal"
                  type="text"
                  name="principal"
                  validate={{
                    required: { value: true, errorMessage: translate('entity.validation.required') },
                  }}
                />
              </AvGroup>
              <AvGroup>
                <Label for="user-profile-actualNode">
                  <Translate contentKey="adminApp.recorderUserProfile.actualNode">Actual Node</Translate>
                </Label>
                <AvInput id="user-profile-actualNode" data-cy="actualNode" type="select" className="form-control" name="actualNodeId">
                  <option value="" key="0" />
                  {nodes
                    ? nodes.map(otherEntity => (
                        <option value={otherEntity.id} key={otherEntity.id}>
                          {otherEntity.name}
                        </option>
                      ))
                    : null}
                </AvInput>
              </AvGroup>
              <AvGroup>
                <Label for="user-profile-assignedNodes">
                  <Translate contentKey="adminApp.recorderUserProfile.assignedNodes">Assigned Nodes</Translate>
                </Label>
                <AvInput
                  id="user-profile-assignedNodes"
                  data-cy="assignedNodes"
                  type="select"
                  multiple
                  className="form-control"
                  name="assignedNodes"
                  value={!isNew && userProfileEntity.assignedNodes && userProfileEntity.assignedNodes.map(e => e.id)}
                >
                  <option value="" key="0" />
                  {nodes
                    ? nodes.map(otherEntity => (
                        <option value={otherEntity.id} key={otherEntity.id}>
                          {otherEntity.name}
                        </option>
                      ))
                    : null}
                </AvInput>
              </AvGroup>
              <AvGroup>
                <Label for="user-profile-assignedCategories">
                  <Translate contentKey="adminApp.recorderUserProfile.assignedCategories">Assigned Categories</Translate>
                </Label>
                <AvInput
                  id="user-profile-assignedCategories"
                  data-cy="assignedCategories"
                  type="select"
                  multiple
                  className="form-control"
                  name="assignedCategories"
                  value={!isNew && userProfileEntity.assignedCategories && userProfileEntity.assignedCategories.map(e => e.id)}
                >
                  <option value="" key="0" />
                  {categoryLabels
                    ? categoryLabels.map(otherEntity => (
                        <option value={otherEntity.id} key={otherEntity.id}>
                          {otherEntity.name}
                        </option>
                      ))
                    : null}
                </AvInput>
              </AvGroup>
              <AvGroup>
                <Label for="user-profile-machineLabel">
                  <Translate contentKey="adminApp.recorderUserProfile.machineLabel">Machine Label</Translate>
                </Label>
                <AvInput
                  id="user-profile-machineLabel"
                  data-cy="machineLabel"
                  type="select"
                  multiple
                  className="form-control"
                  name="machineLabels"
                  value={!isNew && userProfileEntity.machineLabels && userProfileEntity.machineLabels.map(e => e.id)}
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
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/user-profile" replace color="info">
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
  nodes: storeState.node.entities,
  categoryLabels: storeState.categoryLabel.entities,
  machineLabels: storeState.machineLabel.entities,
  userGroups: storeState.userGroup.entities,
  userProfileEntity: storeState.userProfile.entity,
  loading: storeState.userProfile.loading,
  updating: storeState.userProfile.updating,
  updateSuccess: storeState.userProfile.updateSuccess,
});

const mapDispatchToProps = {
  getNodes,
  getCategoryLabels,
  getMachineLabels,
  getUserGroups,
  getEntity,
  updateEntity,
  createEntity,
  reset,
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(UserProfileUpdate);
