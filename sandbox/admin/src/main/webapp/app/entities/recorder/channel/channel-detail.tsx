import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootState } from 'app/shared/reducers';
import { getEntity } from './channel.reducer';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

export interface IChannelDetailProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export const ChannelDetail = (props: IChannelDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const { channelEntity } = props;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="channelDetailsHeading">
          <Translate contentKey="adminApp.recorderChannel.detail.title">Channel</Translate>
        </h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">
              <Translate contentKey="global.field.id">ID</Translate>
            </span>
          </dt>
          <dd>{channelEntity.id}</dd>
          <dt>
            <span id="mediaType">
              <Translate contentKey="adminApp.recorderChannel.mediaType">Media Type</Translate>
            </span>
          </dt>
          <dd>{channelEntity.mediaType}</dd>
          <dt>
            <span id="name">
              <Translate contentKey="adminApp.recorderChannel.name">Name</Translate>
            </span>
          </dt>
          <dd>{channelEntity.name}</dd>
          <dt>
            <span id="throwAwayAllowed">
              <Translate contentKey="adminApp.recorderChannel.throwAwayAllowed">Throw Away Allowed</Translate>
            </span>
          </dt>
          <dd>{channelEntity.throwAwayAllowed ? 'true' : 'false'}</dd>
          <dt>
            <span id="threatAllowed">
              <Translate contentKey="adminApp.recorderChannel.threatAllowed">Threat Allowed</Translate>
            </span>
          </dt>
          <dd>{channelEntity.threatAllowed ? 'true' : 'false'}</dd>
          <dt>
            <Translate contentKey="adminApp.recorderChannel.nodes">Nodes</Translate>
          </dt>
          <dd>
            {channelEntity.nodes
              ? channelEntity.nodes.map((val, i) => (
                  <span key={val.id}>
                    <a>{val.name}</a>
                    {channelEntity.nodes && i === channelEntity.nodes.length - 1 ? '' : ', '}
                  </span>
                ))
              : null}
          </dd>
        </dl>
        <Button tag={Link} to="/channel" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" />{' '}
          <span className="d-none d-md-inline">
            <Translate contentKey="entity.action.back">Back</Translate>
          </span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/channel/${channelEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" />{' '}
          <span className="d-none d-md-inline">
            <Translate contentKey="entity.action.edit">Edit</Translate>
          </span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStateToProps = ({ channel }: IRootState) => ({
  channelEntity: channel.entity,
});

const mapDispatchToProps = { getEntity };

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(ChannelDetail);
