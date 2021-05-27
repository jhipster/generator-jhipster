import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootState } from 'app/shared/reducers';
import { getEntity } from './machine-label.reducer';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

export interface IMachineLabelDetailProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export const MachineLabelDetail = (props: IMachineLabelDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const { machineLabelEntity } = props;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="machineLabelDetailsHeading">
          <Translate contentKey="adminApp.recorderMachineLabel.detail.title">MachineLabel</Translate>
        </h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">
              <Translate contentKey="global.field.id">ID</Translate>
            </span>
          </dt>
          <dd>{machineLabelEntity.id}</dd>
          <dt>
            <span id="name">
              <Translate contentKey="adminApp.recorderMachineLabel.name">Name</Translate>
            </span>
          </dt>
          <dd>{machineLabelEntity.name}</dd>
          <dt>
            <span id="value">
              <Translate contentKey="adminApp.recorderMachineLabel.value">Value</Translate>
            </span>
          </dt>
          <dd>{machineLabelEntity.value}</dd>
          <dt>
            <Translate contentKey="adminApp.recorderMachineLabel.records">Records</Translate>
          </dt>
          <dd>
            {machineLabelEntity.records
              ? machineLabelEntity.records.map((val, i) => (
                  <span key={val.id}>
                    <a>{val.id}</a>
                    {machineLabelEntity.records && i === machineLabelEntity.records.length - 1 ? '' : ', '}
                  </span>
                ))
              : null}
          </dd>
        </dl>
        <Button tag={Link} to="/machine-label" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" />{' '}
          <span className="d-none d-md-inline">
            <Translate contentKey="entity.action.back">Back</Translate>
          </span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/machine-label/${machineLabelEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" />{' '}
          <span className="d-none d-md-inline">
            <Translate contentKey="entity.action.edit">Edit</Translate>
          </span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStateToProps = ({ machineLabel }: IRootState) => ({
  machineLabelEntity: machineLabel.entity,
});

const mapDispatchToProps = { getEntity };

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(MachineLabelDetail);
