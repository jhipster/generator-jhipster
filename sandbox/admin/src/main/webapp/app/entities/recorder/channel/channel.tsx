import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Col, Row, Table } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootState } from 'app/shared/reducers';
import { getEntities } from './channel.reducer';
import { IChannel } from 'app/shared/model/recorder/channel.model';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

export interface IChannelProps extends StateProps, DispatchProps, RouteComponentProps<{ url: string }> {}

export const Channel = (props: IChannelProps) => {
  useEffect(() => {
    props.getEntities();
  }, []);

  const handleSyncList = () => {
    props.getEntities();
  };

  const { channelList, match, loading } = props;
  return (
    <div>
      <h2 id="channel-heading" data-cy="ChannelHeading">
        <Translate contentKey="adminApp.recorderChannel.home.title">Channels</Translate>
        <div className="d-flex justify-content-end">
          <Button className="mr-2" color="info" onClick={handleSyncList} disabled={loading}>
            <FontAwesomeIcon icon="sync" spin={loading} />{' '}
            <Translate contentKey="adminApp.recorderChannel.home.refreshListLabel">Refresh List</Translate>
          </Button>
          <Link to={`${match.url}/new`} className="btn btn-primary jh-create-entity" id="jh-create-entity" data-cy="entityCreateButton">
            <FontAwesomeIcon icon="plus" />
            &nbsp;
            <Translate contentKey="adminApp.recorderChannel.home.createLabel">Create new Channel</Translate>
          </Link>
        </div>
      </h2>
      <div className="table-responsive">
        {channelList && channelList.length > 0 ? (
          <Table responsive>
            <thead>
              <tr>
                <th>
                  <Translate contentKey="adminApp.recorderChannel.id">ID</Translate>
                </th>
                <th>
                  <Translate contentKey="adminApp.recorderChannel.mediaType">Media Type</Translate>
                </th>
                <th>
                  <Translate contentKey="adminApp.recorderChannel.name">Name</Translate>
                </th>
                <th>
                  <Translate contentKey="adminApp.recorderChannel.throwAwayAllowed">Throw Away Allowed</Translate>
                </th>
                <th>
                  <Translate contentKey="adminApp.recorderChannel.threatAllowed">Threat Allowed</Translate>
                </th>
                <th>
                  <Translate contentKey="adminApp.recorderChannel.nodes">Nodes</Translate>
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {channelList.map((channel, i) => (
                <tr key={`entity-${i}`} data-cy="entityTable">
                  <td>
                    <Button tag={Link} to={`${match.url}/${channel.id}`} color="link" size="sm">
                      {channel.id}
                    </Button>
                  </td>
                  <td>
                    <Translate contentKey={`adminApp.MediaType.${channel.mediaType}`} />
                  </td>
                  <td>{channel.name}</td>
                  <td>{channel.throwAwayAllowed ? 'true' : 'false'}</td>
                  <td>{channel.threatAllowed ? 'true' : 'false'}</td>
                  <td>
                    {channel.nodes
                      ? channel.nodes.map((val, j) => (
                          <span key={j}>
                            <Link to={`node/${val.id}`}>{val.name}</Link>
                            {j === channel.nodes.length - 1 ? '' : ', '}
                          </span>
                        ))
                      : null}
                  </td>
                  <td className="text-right">
                    <div className="btn-group flex-btn-group-container">
                      <Button tag={Link} to={`${match.url}/${channel.id}`} color="info" size="sm" data-cy="entityDetailsButton">
                        <FontAwesomeIcon icon="eye" />{' '}
                        <span className="d-none d-md-inline">
                          <Translate contentKey="entity.action.view">View</Translate>
                        </span>
                      </Button>
                      <Button tag={Link} to={`${match.url}/${channel.id}/edit`} color="primary" size="sm" data-cy="entityEditButton">
                        <FontAwesomeIcon icon="pencil-alt" />{' '}
                        <span className="d-none d-md-inline">
                          <Translate contentKey="entity.action.edit">Edit</Translate>
                        </span>
                      </Button>
                      <Button tag={Link} to={`${match.url}/${channel.id}/delete`} color="danger" size="sm" data-cy="entityDeleteButton">
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
              <Translate contentKey="adminApp.recorderChannel.home.notFound">No Channels found</Translate>
            </div>
          )
        )}
      </div>
    </div>
  );
};

const mapStateToProps = ({ channel }: IRootState) => ({
  channelList: channel.entities,
  loading: channel.loading,
});

const mapDispatchToProps = {
  getEntities,
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(Channel);
