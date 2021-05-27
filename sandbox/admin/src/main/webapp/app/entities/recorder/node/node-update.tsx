import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, Label } from 'reactstrap';
import { AvFeedback, AvForm, AvGroup, AvInput, AvField } from 'availity-reactstrap-validation';
import { Translate, translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootState } from 'app/shared/reducers';

import { getEntities as getNodes } from 'app/entities/recorder/node/node.reducer';
import { IChannel } from 'app/shared/model/recorder/channel.model';
import { getEntities as getChannels } from 'app/entities/recorder/channel/channel.reducer';
import { IUserProfile } from 'app/shared/model/recorder/user-profile.model';
import { getEntities as getUserProfiles } from 'app/entities/recorder/user-profile/user-profile.reducer';
import { getEntity, updateEntity, createEntity, reset } from './node.reducer';
import { INode } from 'app/shared/model/recorder/node.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface INodeUpdateProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export const NodeUpdate = (props: INodeUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const { nodeEntity, nodes, channels, userProfiles, loading, updating } = props;

  const handleClose = () => {
    props.history.push('/node');
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getNodes();
    props.getChannels();
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
        ...nodeEntity,
        ...values,
        parent: nodes.find(it => it.id.toString() === values.parentId.toString()),
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
          <h2 id="adminApp.recorderNode.home.createOrEditLabel" data-cy="NodeCreateUpdateHeading">
            <Translate contentKey="adminApp.recorderNode.home.createOrEditLabel">Create or edit a Node</Translate>
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <AvForm model={isNew ? {} : nodeEntity} onSubmit={saveEntity}>
              {!isNew ? (
                <AvGroup>
                  <Label for="node-id">
                    <Translate contentKey="global.field.id">ID</Translate>
                  </Label>
                  <AvInput id="node-id" type="text" className="form-control" name="id" required readOnly />
                </AvGroup>
              ) : null}
              <AvGroup>
                <Label id="nameLabel" for="node-name">
                  <Translate contentKey="adminApp.recorderNode.name">Name</Translate>
                </Label>
                <AvField
                  id="node-name"
                  data-cy="name"
                  type="text"
                  name="name"
                  validate={{
                    required: { value: true, errorMessage: translate('entity.validation.required') },
                  }}
                />
              </AvGroup>
              <AvGroup>
                <Label id="descriptionLabel" for="node-description">
                  <Translate contentKey="adminApp.recorderNode.description">Description</Translate>
                </Label>
                <AvField id="node-description" data-cy="description" type="text" name="description" />
              </AvGroup>
              <AvGroup>
                <Label id="timeToLiveLabel" for="node-timeToLive">
                  <Translate contentKey="adminApp.recorderNode.timeToLive">Time To Live</Translate>
                </Label>
                <AvField id="node-timeToLive" data-cy="timeToLive" type="string" className="form-control" name="timeToLive" />
              </AvGroup>
              <AvGroup>
                <Label for="node-parent">
                  <Translate contentKey="adminApp.recorderNode.parent">Parent</Translate>
                </Label>
                <AvInput id="node-parent" data-cy="parent" type="select" className="form-control" name="parentId">
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
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/node" replace color="info">
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
  channels: storeState.channel.entities,
  userProfiles: storeState.userProfile.entities,
  nodeEntity: storeState.node.entity,
  loading: storeState.node.loading,
  updating: storeState.node.updating,
  updateSuccess: storeState.node.updateSuccess,
});

const mapDispatchToProps = {
  getNodes,
  getChannels,
  getUserProfiles,
  getEntity,
  updateEntity,
  createEntity,
  reset,
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(NodeUpdate);
