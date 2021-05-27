import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, Label } from 'reactstrap';
import { AvFeedback, AvForm, AvGroup, AvInput, AvField } from 'availity-reactstrap-validation';
import { Translate, translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootState } from 'app/shared/reducers';

import { IRecord } from 'app/shared/model/recorder/record.model';
import { getEntities as getRecords } from 'app/entities/recorder/record/record.reducer';
import { IUserGroup } from 'app/shared/model/recorder/user-group.model';
import { getEntities as getUserGroups } from 'app/entities/recorder/user-group/user-group.reducer';
import { IUserProfile } from 'app/shared/model/recorder/user-profile.model';
import { getEntities as getUserProfiles } from 'app/entities/recorder/user-profile/user-profile.reducer';
import { getEntity, updateEntity, createEntity, reset } from './machine-label.reducer';
import { IMachineLabel } from 'app/shared/model/recorder/machine-label.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface IMachineLabelUpdateProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export const MachineLabelUpdate = (props: IMachineLabelUpdateProps) => {
  const [idsrecords, setIdsrecords] = useState([]);
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const { machineLabelEntity, records, userGroups, userProfiles, loading, updating } = props;

  const handleClose = () => {
    props.history.push('/machine-label');
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getRecords();
    props.getUserGroups();
    props.getUserProfiles();
  }, []);

  useEffect(() => {
    if (props.updateSuccess) {
      handleClose();
    }
  }, [props.updateSuccess]);

  const saveEntity = (event, errors, values) => {
    if (errors.length === 0) {
      const entity = {
        ...machineLabelEntity,
        ...values,
        records: mapIdList(values.records),
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
          <h2 id="adminApp.recorderMachineLabel.home.createOrEditLabel" data-cy="MachineLabelCreateUpdateHeading">
            <Translate contentKey="adminApp.recorderMachineLabel.home.createOrEditLabel">Create or edit a MachineLabel</Translate>
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <AvForm model={isNew ? {} : machineLabelEntity} onSubmit={saveEntity}>
              {!isNew ? (
                <AvGroup>
                  <Label for="machine-label-id">
                    <Translate contentKey="global.field.id">ID</Translate>
                  </Label>
                  <AvInput id="machine-label-id" type="text" className="form-control" name="id" required readOnly />
                </AvGroup>
              ) : null}
              <AvGroup>
                <Label id="nameLabel" for="machine-label-name">
                  <Translate contentKey="adminApp.recorderMachineLabel.name">Name</Translate>
                </Label>
                <AvField
                  id="machine-label-name"
                  data-cy="name"
                  type="text"
                  name="name"
                  validate={{
                    required: { value: true, errorMessage: translate('entity.validation.required') },
                  }}
                />
              </AvGroup>
              <AvGroup>
                <Label id="valueLabel" for="machine-label-value">
                  <Translate contentKey="adminApp.recorderMachineLabel.value">Value</Translate>
                </Label>
                <AvField id="machine-label-value" data-cy="value" type="text" name="value" />
              </AvGroup>
              <AvGroup>
                <Label for="machine-label-records">
                  <Translate contentKey="adminApp.recorderMachineLabel.records">Records</Translate>
                </Label>
                <AvInput
                  id="machine-label-records"
                  data-cy="records"
                  type="select"
                  multiple
                  className="form-control"
                  name="records"
                  value={!isNew && machineLabelEntity.records && machineLabelEntity.records.map(e => e.id)}
                >
                  <option value="" key="0" />
                  {records
                    ? records.map(otherEntity => (
                        <option value={otherEntity.id} key={otherEntity.id}>
                          {otherEntity.id}
                        </option>
                      ))
                    : null}
                </AvInput>
              </AvGroup>
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/machine-label" replace color="info">
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
  records: storeState.record.entities,
  userGroups: storeState.userGroup.entities,
  userProfiles: storeState.userProfile.entities,
  machineLabelEntity: storeState.machineLabel.entity,
  loading: storeState.machineLabel.loading,
  updating: storeState.machineLabel.updating,
  updateSuccess: storeState.machineLabel.updateSuccess,
});

const mapDispatchToProps = {
  getRecords,
  getUserGroups,
  getUserProfiles,
  getEntity,
  updateEntity,
  createEntity,
  reset,
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(MachineLabelUpdate);
