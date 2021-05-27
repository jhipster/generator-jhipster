import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Col, Row, Table } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootState } from 'app/shared/reducers';
import { getEntities } from './machine-label.reducer';
import { IMachineLabel } from 'app/shared/model/recorder/machine-label.model';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

export interface IMachineLabelProps extends StateProps, DispatchProps, RouteComponentProps<{ url: string }> {}

export const MachineLabel = (props: IMachineLabelProps) => {
  useEffect(() => {
    props.getEntities();
  }, []);

  const handleSyncList = () => {
    props.getEntities();
  };

  const { machineLabelList, match, loading } = props;
  return (
    <div>
      <h2 id="machine-label-heading" data-cy="MachineLabelHeading">
        <Translate contentKey="adminApp.recorderMachineLabel.home.title">Machine Labels</Translate>
        <div className="d-flex justify-content-end">
          <Button className="mr-2" color="info" onClick={handleSyncList} disabled={loading}>
            <FontAwesomeIcon icon="sync" spin={loading} />{' '}
            <Translate contentKey="adminApp.recorderMachineLabel.home.refreshListLabel">Refresh List</Translate>
          </Button>
          <Link to={`${match.url}/new`} className="btn btn-primary jh-create-entity" id="jh-create-entity" data-cy="entityCreateButton">
            <FontAwesomeIcon icon="plus" />
            &nbsp;
            <Translate contentKey="adminApp.recorderMachineLabel.home.createLabel">Create new Machine Label</Translate>
          </Link>
        </div>
      </h2>
      <div className="table-responsive">
        {machineLabelList && machineLabelList.length > 0 ? (
          <Table responsive>
            <thead>
              <tr>
                <th>
                  <Translate contentKey="adminApp.recorderMachineLabel.id">ID</Translate>
                </th>
                <th>
                  <Translate contentKey="adminApp.recorderMachineLabel.name">Name</Translate>
                </th>
                <th>
                  <Translate contentKey="adminApp.recorderMachineLabel.value">Value</Translate>
                </th>
                <th>
                  <Translate contentKey="adminApp.recorderMachineLabel.records">Records</Translate>
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {machineLabelList.map((machineLabel, i) => (
                <tr key={`entity-${i}`} data-cy="entityTable">
                  <td>
                    <Button tag={Link} to={`${match.url}/${machineLabel.id}`} color="link" size="sm">
                      {machineLabel.id}
                    </Button>
                  </td>
                  <td>{machineLabel.name}</td>
                  <td>{machineLabel.value}</td>
                  <td>
                    {machineLabel.records
                      ? machineLabel.records.map((val, j) => (
                          <span key={j}>
                            <Link to={`record/${val.id}`}>{val.id}</Link>
                            {j === machineLabel.records.length - 1 ? '' : ', '}
                          </span>
                        ))
                      : null}
                  </td>
                  <td className="text-right">
                    <div className="btn-group flex-btn-group-container">
                      <Button tag={Link} to={`${match.url}/${machineLabel.id}`} color="info" size="sm" data-cy="entityDetailsButton">
                        <FontAwesomeIcon icon="eye" />{' '}
                        <span className="d-none d-md-inline">
                          <Translate contentKey="entity.action.view">View</Translate>
                        </span>
                      </Button>
                      <Button tag={Link} to={`${match.url}/${machineLabel.id}/edit`} color="primary" size="sm" data-cy="entityEditButton">
                        <FontAwesomeIcon icon="pencil-alt" />{' '}
                        <span className="d-none d-md-inline">
                          <Translate contentKey="entity.action.edit">Edit</Translate>
                        </span>
                      </Button>
                      <Button
                        tag={Link}
                        to={`${match.url}/${machineLabel.id}/delete`}
                        color="danger"
                        size="sm"
                        data-cy="entityDeleteButton"
                      >
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
              <Translate contentKey="adminApp.recorderMachineLabel.home.notFound">No Machine Labels found</Translate>
            </div>
          )
        )}
      </div>
    </div>
  );
};

const mapStateToProps = ({ machineLabel }: IRootState) => ({
  machineLabelList: machineLabel.entities,
  loading: machineLabel.loading,
});

const mapDispatchToProps = {
  getEntities,
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(MachineLabel);
