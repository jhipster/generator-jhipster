import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootState } from 'app/shared/reducers';
import { getEntity } from './node.reducer';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

export interface INodeDetailProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export const NodeDetail = (props: INodeDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const { nodeEntity } = props;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="nodeDetailsHeading">
          <Translate contentKey="adminApp.recorderNode.detail.title">Node</Translate>
        </h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">
              <Translate contentKey="global.field.id">ID</Translate>
            </span>
          </dt>
          <dd>{nodeEntity.id}</dd>
          <dt>
            <span id="name">
              <Translate contentKey="adminApp.recorderNode.name">Name</Translate>
            </span>
          </dt>
          <dd>{nodeEntity.name}</dd>
          <dt>
            <span id="description">
              <Translate contentKey="adminApp.recorderNode.description">Description</Translate>
            </span>
          </dt>
          <dd>{nodeEntity.description}</dd>
          <dt>
            <span id="timeToLive">
              <Translate contentKey="adminApp.recorderNode.timeToLive">Time To Live</Translate>
            </span>
          </dt>
          <dd>{nodeEntity.timeToLive}</dd>
          <dt>
            <Translate contentKey="adminApp.recorderNode.parent">Parent</Translate>
          </dt>
          <dd>{nodeEntity.parent ? nodeEntity.parent.name : ''}</dd>
        </dl>
        <Button tag={Link} to="/node" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" />{' '}
          <span className="d-none d-md-inline">
            <Translate contentKey="entity.action.back">Back</Translate>
          </span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/node/${nodeEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" />{' '}
          <span className="d-none d-md-inline">
            <Translate contentKey="entity.action.edit">Edit</Translate>
          </span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStateToProps = ({ node }: IRootState) => ({
  nodeEntity: node.entity,
});

const mapDispatchToProps = { getEntity };

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(NodeDetail);
