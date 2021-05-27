import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { Translate, TextFormat } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootState } from 'app/shared/reducers';
import { getEntity } from './record.reducer';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

export interface IRecordDetailProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export const RecordDetail = (props: IRecordDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const { recordEntity } = props;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="recordDetailsHeading">
          <Translate contentKey="adminApp.recorderRecord.detail.title">Record</Translate>
        </h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">
              <Translate contentKey="global.field.id">ID</Translate>
            </span>
          </dt>
          <dd>{recordEntity.id}</dd>
          <dt>
            <span id="date">
              <Translate contentKey="adminApp.recorderRecord.date">Date</Translate>
            </span>
          </dt>
          <dd>{recordEntity.date ? <TextFormat value={recordEntity.date} type="date" format={APP_DATE_FORMAT} /> : null}</dd>
          <dt>
            <span id="length">
              <Translate contentKey="adminApp.recorderRecord.length">Length</Translate>
            </span>
          </dt>
          <dd>{recordEntity.length}</dd>
          <dt>
            <span id="throwAway">
              <Translate contentKey="adminApp.recorderRecord.throwAway">Throw Away</Translate>
            </span>
          </dt>
          <dd>{recordEntity.throwAway ? 'true' : 'false'}</dd>
          <dt>
            <span id="threat">
              <Translate contentKey="adminApp.recorderRecord.threat">Threat</Translate>
            </span>
          </dt>
          <dd>{recordEntity.threat ? 'true' : 'false'}</dd>
          <dt>
            <Translate contentKey="adminApp.recorderRecord.channel">Channel</Translate>
          </dt>
          <dd>{recordEntity.channel ? recordEntity.channel.name : ''}</dd>
        </dl>
        <Button tag={Link} to="/record" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" />{' '}
          <span className="d-none d-md-inline">
            <Translate contentKey="entity.action.back">Back</Translate>
          </span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/record/${recordEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" />{' '}
          <span className="d-none d-md-inline">
            <Translate contentKey="entity.action.edit">Edit</Translate>
          </span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStateToProps = ({ record }: IRootState) => ({
  recordEntity: record.entity,
});

const mapDispatchToProps = { getEntity };

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(RecordDetail);
