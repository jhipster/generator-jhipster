import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootState } from 'app/shared/reducers';
import { getEntity } from './category-label.reducer';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

export interface ICategoryLabelDetailProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export const CategoryLabelDetail = (props: ICategoryLabelDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const { categoryLabelEntity } = props;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="categoryLabelDetailsHeading">
          <Translate contentKey="adminApp.recorderCategoryLabel.detail.title">CategoryLabel</Translate>
        </h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">
              <Translate contentKey="global.field.id">ID</Translate>
            </span>
          </dt>
          <dd>{categoryLabelEntity.id}</dd>
          <dt>
            <span id="name">
              <Translate contentKey="adminApp.recorderCategoryLabel.name">Name</Translate>
            </span>
          </dt>
          <dd>{categoryLabelEntity.name}</dd>
          <dt>
            <span id="description">
              <Translate contentKey="adminApp.recorderCategoryLabel.description">Description</Translate>
            </span>
          </dt>
          <dd>{categoryLabelEntity.description}</dd>
          <dt>
            <span id="authorityAttach">
              <Translate contentKey="adminApp.recorderCategoryLabel.authorityAttach">Authority Attach</Translate>
            </span>
          </dt>
          <dd>{categoryLabelEntity.authorityAttach}</dd>
          <dt>
            <Translate contentKey="adminApp.recorderCategoryLabel.record">Record</Translate>
          </dt>
          <dd>
            {categoryLabelEntity.records
              ? categoryLabelEntity.records.map((val, i) => (
                  <span key={val.id}>
                    <a>{val.id}</a>
                    {categoryLabelEntity.records && i === categoryLabelEntity.records.length - 1 ? '' : ', '}
                  </span>
                ))
              : null}
          </dd>
        </dl>
        <Button tag={Link} to="/category-label" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" />{' '}
          <span className="d-none d-md-inline">
            <Translate contentKey="entity.action.back">Back</Translate>
          </span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/category-label/${categoryLabelEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" />{' '}
          <span className="d-none d-md-inline">
            <Translate contentKey="entity.action.edit">Edit</Translate>
          </span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStateToProps = ({ categoryLabel }: IRootState) => ({
  categoryLabelEntity: categoryLabel.entity,
});

const mapDispatchToProps = { getEntity };

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(CategoryLabelDetail);
