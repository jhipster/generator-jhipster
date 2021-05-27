import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootState } from 'app/shared/reducers';
import { getEntity } from './search-label.reducer';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

export interface ISearchLabelDetailProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export const SearchLabelDetail = (props: ISearchLabelDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const { searchLabelEntity } = props;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="searchLabelDetailsHeading">
          <Translate contentKey="adminApp.recorderSearchLabel.detail.title">SearchLabel</Translate>
        </h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">
              <Translate contentKey="global.field.id">ID</Translate>
            </span>
          </dt>
          <dd>{searchLabelEntity.id}</dd>
          <dt>
            <span id="name">
              <Translate contentKey="adminApp.recorderSearchLabel.name">Name</Translate>
            </span>
          </dt>
          <dd>{searchLabelEntity.name}</dd>
          <dt>
            <span id="description">
              <Translate contentKey="adminApp.recorderSearchLabel.description">Description</Translate>
            </span>
          </dt>
          <dd>{searchLabelEntity.description}</dd>
          <dt>
            <Translate contentKey="adminApp.recorderSearchLabel.records">Records</Translate>
          </dt>
          <dd>
            {searchLabelEntity.records
              ? searchLabelEntity.records.map((val, i) => (
                  <span key={val.id}>
                    <a>{val.id}</a>
                    {searchLabelEntity.records && i === searchLabelEntity.records.length - 1 ? '' : ', '}
                  </span>
                ))
              : null}
          </dd>
          <dt>
            <Translate contentKey="adminApp.recorderSearchLabel.userProfile">User Profile</Translate>
          </dt>
          <dd>{searchLabelEntity.userProfile ? searchLabelEntity.userProfile.id : ''}</dd>
        </dl>
        <Button tag={Link} to="/search-label" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" />{' '}
          <span className="d-none d-md-inline">
            <Translate contentKey="entity.action.back">Back</Translate>
          </span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/search-label/${searchLabelEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" />{' '}
          <span className="d-none d-md-inline">
            <Translate contentKey="entity.action.edit">Edit</Translate>
          </span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStateToProps = ({ searchLabel }: IRootState) => ({
  searchLabelEntity: searchLabel.entity,
});

const mapDispatchToProps = { getEntity };

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(SearchLabelDetail);
