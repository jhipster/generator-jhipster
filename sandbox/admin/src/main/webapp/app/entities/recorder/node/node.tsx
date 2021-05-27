import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Col, Row, Table } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootState } from 'app/shared/reducers';
import { getEntities } from './node.reducer';
import { INode } from 'app/shared/model/recorder/node.model';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

export interface INodeProps extends StateProps, DispatchProps, RouteComponentProps<{ url: string }> {}

export const Node = (props: INodeProps) => {
  useEffect(() => {
    props.getEntities();
  }, []);

  const handleSyncList = () => {
    props.getEntities();
  };

  const { nodeList, match, loading } = props;
  return (
    <div>
      <h2 id="node-heading" data-cy="NodeHeading">
        <Translate contentKey="adminApp.recorderNode.home.title">Nodes</Translate>
        <div className="d-flex justify-content-end">
          <Button className="mr-2" color="info" onClick={handleSyncList} disabled={loading}>
            <FontAwesomeIcon icon="sync" spin={loading} />{' '}
            <Translate contentKey="adminApp.recorderNode.home.refreshListLabel">Refresh List</Translate>
          </Button>
          <Link to={`${match.url}/new`} className="btn btn-primary jh-create-entity" id="jh-create-entity" data-cy="entityCreateButton">
            <FontAwesomeIcon icon="plus" />
            &nbsp;
            <Translate contentKey="adminApp.recorderNode.home.createLabel">Create new Node</Translate>
          </Link>
        </div>
      </h2>
      <div className="table-responsive">
        {nodeList && nodeList.length > 0 ? (
          <Table responsive>
            <thead>
              <tr>
                <th>
                  <Translate contentKey="adminApp.recorderNode.id">ID</Translate>
                </th>
                <th>
                  <Translate contentKey="adminApp.recorderNode.name">Name</Translate>
                </th>
                <th>
                  <Translate contentKey="adminApp.recorderNode.description">Description</Translate>
                </th>
                <th>
                  <Translate contentKey="adminApp.recorderNode.timeToLive">Time To Live</Translate>
                </th>
                <th>
                  <Translate contentKey="adminApp.recorderNode.parent">Parent</Translate>
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {nodeList.map((node, i) => (
                <tr key={`entity-${i}`} data-cy="entityTable">
                  <td>
                    <Button tag={Link} to={`${match.url}/${node.id}`} color="link" size="sm">
                      {node.id}
                    </Button>
                  </td>
                  <td>{node.name}</td>
                  <td>{node.description}</td>
                  <td>{node.timeToLive}</td>
                  <td>{node.parent ? <Link to={`node/${node.parent.id}`}>{node.parent.name}</Link> : ''}</td>
                  <td className="text-right">
                    <div className="btn-group flex-btn-group-container">
                      <Button tag={Link} to={`${match.url}/${node.id}`} color="info" size="sm" data-cy="entityDetailsButton">
                        <FontAwesomeIcon icon="eye" />{' '}
                        <span className="d-none d-md-inline">
                          <Translate contentKey="entity.action.view">View</Translate>
                        </span>
                      </Button>
                      <Button tag={Link} to={`${match.url}/${node.id}/edit`} color="primary" size="sm" data-cy="entityEditButton">
                        <FontAwesomeIcon icon="pencil-alt" />{' '}
                        <span className="d-none d-md-inline">
                          <Translate contentKey="entity.action.edit">Edit</Translate>
                        </span>
                      </Button>
                      <Button tag={Link} to={`${match.url}/${node.id}/delete`} color="danger" size="sm" data-cy="entityDeleteButton">
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
              <Translate contentKey="adminApp.recorderNode.home.notFound">No Nodes found</Translate>
            </div>
          )
        )}
      </div>
    </div>
  );
};

const mapStateToProps = ({ node }: IRootState) => ({
  nodeList: node.entities,
  loading: node.loading,
});

const mapDispatchToProps = {
  getEntities,
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(Node);
