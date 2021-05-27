import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, Label } from 'reactstrap';
import { AvFeedback, AvForm, AvGroup, AvInput, AvField } from 'availity-reactstrap-validation';
import { Translate, translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootState } from 'app/shared/reducers';

import { IChannel } from 'app/shared/model/recorder/channel.model';
import { getEntities as getChannels } from 'app/entities/recorder/channel/channel.reducer';
import { ICategoryLabel } from 'app/shared/model/recorder/category-label.model';
import { getEntities as getCategoryLabels } from 'app/entities/recorder/category-label/category-label.reducer';
import { ISearchLabel } from 'app/shared/model/recorder/search-label.model';
import { getEntities as getSearchLabels } from 'app/entities/recorder/search-label/search-label.reducer';
import { IMachineLabel } from 'app/shared/model/recorder/machine-label.model';
import { getEntities as getMachineLabels } from 'app/entities/recorder/machine-label/machine-label.reducer';
import { getEntity, updateEntity, createEntity, reset } from './record.reducer';
import { IRecord } from 'app/shared/model/recorder/record.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface IRecordUpdateProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export const RecordUpdate = (props: IRecordUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const { recordEntity, channels, categoryLabels, searchLabels, machineLabels, loading, updating } = props;

  const handleClose = () => {
    props.history.push('/record');
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getChannels();
    props.getCategoryLabels();
    props.getSearchLabels();
    props.getMachineLabels();
  }, []);

  useEffect(() => {
    if (props.updateSuccess) {
      handleClose();
    }
  }, [props.updateSuccess]);

  const saveEntity = (event, errors, values) => {
    values.date = convertDateTimeToServer(values.date);

    if (errors.length === 0) {
      const entity = {
        ...recordEntity,
        ...values,
        channel: channels.find(it => it.id.toString() === values.channelId.toString()),
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
          <h2 id="adminApp.recorderRecord.home.createOrEditLabel" data-cy="RecordCreateUpdateHeading">
            <Translate contentKey="adminApp.recorderRecord.home.createOrEditLabel">Create or edit a Record</Translate>
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <AvForm model={isNew ? {} : recordEntity} onSubmit={saveEntity}>
              {!isNew ? (
                <AvGroup>
                  <Label for="record-id">
                    <Translate contentKey="global.field.id">ID</Translate>
                  </Label>
                  <AvInput id="record-id" type="text" className="form-control" name="id" required readOnly />
                </AvGroup>
              ) : null}
              <AvGroup>
                <Label id="dateLabel" for="record-date">
                  <Translate contentKey="adminApp.recorderRecord.date">Date</Translate>
                </Label>
                <AvInput
                  id="record-date"
                  data-cy="date"
                  type="datetime-local"
                  className="form-control"
                  name="date"
                  placeholder={'YYYY-MM-DD HH:mm'}
                  value={isNew ? displayDefaultDateTime() : convertDateTimeFromServer(props.recordEntity.date)}
                  validate={{
                    required: { value: true, errorMessage: translate('entity.validation.required') },
                  }}
                />
              </AvGroup>
              <AvGroup>
                <Label id="lengthLabel" for="record-length">
                  <Translate contentKey="adminApp.recorderRecord.length">Length</Translate>
                </Label>
                <AvField
                  id="record-length"
                  data-cy="length"
                  type="string"
                  className="form-control"
                  name="length"
                  validate={{
                    required: { value: true, errorMessage: translate('entity.validation.required') },
                    number: { value: true, errorMessage: translate('entity.validation.number') },
                  }}
                />
              </AvGroup>
              <AvGroup check>
                <Label id="throwAwayLabel">
                  <AvInput id="record-throwAway" data-cy="throwAway" type="checkbox" className="form-check-input" name="throwAway" />
                  <Translate contentKey="adminApp.recorderRecord.throwAway">Throw Away</Translate>
                </Label>
              </AvGroup>
              <AvGroup check>
                <Label id="threatLabel">
                  <AvInput id="record-threat" data-cy="threat" type="checkbox" className="form-check-input" name="threat" />
                  <Translate contentKey="adminApp.recorderRecord.threat">Threat</Translate>
                </Label>
              </AvGroup>
              <AvGroup>
                <Label for="record-channel">
                  <Translate contentKey="adminApp.recorderRecord.channel">Channel</Translate>
                </Label>
                <AvInput id="record-channel" data-cy="channel" type="select" className="form-control" name="channelId" required>
                  <option value="" key="0" />
                  {channels
                    ? channels.map(otherEntity => (
                        <option value={otherEntity.id} key={otherEntity.id}>
                          {otherEntity.name}
                        </option>
                      ))
                    : null}
                </AvInput>
                <AvFeedback>
                  <Translate contentKey="entity.validation.required">This field is required.</Translate>
                </AvFeedback>
              </AvGroup>
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/record" replace color="info">
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
  channels: storeState.channel.entities,
  categoryLabels: storeState.categoryLabel.entities,
  searchLabels: storeState.searchLabel.entities,
  machineLabels: storeState.machineLabel.entities,
  recordEntity: storeState.record.entity,
  loading: storeState.record.loading,
  updating: storeState.record.updating,
  updateSuccess: storeState.record.updateSuccess,
});

const mapDispatchToProps = {
  getChannels,
  getCategoryLabels,
  getSearchLabels,
  getMachineLabels,
  getEntity,
  updateEntity,
  createEntity,
  reset,
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(RecordUpdate);
