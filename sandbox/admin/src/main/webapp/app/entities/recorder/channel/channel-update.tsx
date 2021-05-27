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
import { getEntity, updateEntity, createEntity, reset } from './channel.reducer';
import { IChannel } from 'app/shared/model/recorder/channel.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface IChannelUpdateProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export const ChannelUpdate = (props: IChannelUpdateProps) => {
  const [idsnodes, setIdsnodes] = useState([]);
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const { channelEntity, nodes, loading, updating } = props;

  const handleClose = () => {
    props.history.push('/channel');
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getNodes();
  }, []);

  useEffect(() => {
    if (props.updateSuccess) {
      handleClose();
    }
  }, [props.updateSuccess]);

  const saveEntity = (event, errors, values) => {
    if (errors.length === 0) {
      const entity = {
        ...channelEntity,
        ...values,
        nodes: mapIdList(values.nodes),
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
          <h2 id="adminApp.recorderChannel.home.createOrEditLabel" data-cy="ChannelCreateUpdateHeading">
            <Translate contentKey="adminApp.recorderChannel.home.createOrEditLabel">Create or edit a Channel</Translate>
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <AvForm model={isNew ? {} : channelEntity} onSubmit={saveEntity}>
              {!isNew ? (
                <AvGroup>
                  <Label for="channel-id">
                    <Translate contentKey="global.field.id">ID</Translate>
                  </Label>
                  <AvInput id="channel-id" type="text" className="form-control" name="id" required readOnly />
                </AvGroup>
              ) : null}
              <AvGroup>
                <Label id="mediaTypeLabel" for="channel-mediaType">
                  <Translate contentKey="adminApp.recorderChannel.mediaType">Media Type</Translate>
                </Label>
                <AvInput
                  id="channel-mediaType"
                  data-cy="mediaType"
                  type="select"
                  className="form-control"
                  name="mediaType"
                  value={(!isNew && channelEntity.mediaType) || 'AUDIO'}
                >
                  <option value="AUDIO">{translate('adminApp.MediaType.AUDIO')}</option>
                  <option value="VIDEO">{translate('adminApp.MediaType.VIDEO')}</option>
                </AvInput>
              </AvGroup>
              <AvGroup>
                <Label id="nameLabel" for="channel-name">
                  <Translate contentKey="adminApp.recorderChannel.name">Name</Translate>
                </Label>
                <AvField
                  id="channel-name"
                  data-cy="name"
                  type="text"
                  name="name"
                  validate={{
                    required: { value: true, errorMessage: translate('entity.validation.required') },
                  }}
                />
              </AvGroup>
              <AvGroup check>
                <Label id="throwAwayAllowedLabel">
                  <AvInput
                    id="channel-throwAwayAllowed"
                    data-cy="throwAwayAllowed"
                    type="checkbox"
                    className="form-check-input"
                    name="throwAwayAllowed"
                  />
                  <Translate contentKey="adminApp.recorderChannel.throwAwayAllowed">Throw Away Allowed</Translate>
                </Label>
              </AvGroup>
              <AvGroup check>
                <Label id="threatAllowedLabel">
                  <AvInput
                    id="channel-threatAllowed"
                    data-cy="threatAllowed"
                    type="checkbox"
                    className="form-check-input"
                    name="threatAllowed"
                  />
                  <Translate contentKey="adminApp.recorderChannel.threatAllowed">Threat Allowed</Translate>
                </Label>
              </AvGroup>
              <AvGroup>
                <Label for="channel-nodes">
                  <Translate contentKey="adminApp.recorderChannel.nodes">Nodes</Translate>
                </Label>
                <AvInput
                  id="channel-nodes"
                  data-cy="nodes"
                  type="select"
                  multiple
                  className="form-control"
                  name="nodes"
                  value={!isNew && channelEntity.nodes && channelEntity.nodes.map(e => e.id)}
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
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/channel" replace color="info">
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
  channelEntity: storeState.channel.entity,
  loading: storeState.channel.loading,
  updating: storeState.channel.updating,
  updateSuccess: storeState.channel.updateSuccess,
});

const mapDispatchToProps = {
  getNodes,
  getEntity,
  updateEntity,
  createEntity,
  reset,
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(ChannelUpdate);
