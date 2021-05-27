import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Col, Row, Table } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootState } from 'app/shared/reducers';
import { getEntities } from './category-label.reducer';
import { ICategoryLabel } from 'app/shared/model/recorder/category-label.model';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

export interface ICategoryLabelProps extends StateProps, DispatchProps, RouteComponentProps<{ url: string }> {}

export const CategoryLabel = (props: ICategoryLabelProps) => {
  useEffect(() => {
    props.getEntities();
  }, []);

  const handleSyncList = () => {
    props.getEntities();
  };

  const { categoryLabelList, match, loading } = props;
  return (
    <div>
      <h2 id="category-label-heading" data-cy="CategoryLabelHeading">
        <Translate contentKey="adminApp.recorderCategoryLabel.home.title">Category Labels</Translate>
        <div className="d-flex justify-content-end">
          <Button className="mr-2" color="info" onClick={handleSyncList} disabled={loading}>
            <FontAwesomeIcon icon="sync" spin={loading} />{' '}
            <Translate contentKey="adminApp.recorderCategoryLabel.home.refreshListLabel">Refresh List</Translate>
          </Button>
          <Link to={`${match.url}/new`} className="btn btn-primary jh-create-entity" id="jh-create-entity" data-cy="entityCreateButton">
            <FontAwesomeIcon icon="plus" />
            &nbsp;
            <Translate contentKey="adminApp.recorderCategoryLabel.home.createLabel">Create new Category Label</Translate>
          </Link>
        </div>
      </h2>
      <div className="table-responsive">
        {categoryLabelList && categoryLabelList.length > 0 ? (
          <Table responsive>
            <thead>
              <tr>
                <th>
                  <Translate contentKey="adminApp.recorderCategoryLabel.id">ID</Translate>
                </th>
                <th>
                  <Translate contentKey="adminApp.recorderCategoryLabel.name">Name</Translate>
                </th>
                <th>
                  <Translate contentKey="adminApp.recorderCategoryLabel.description">Description</Translate>
                </th>
                <th>
                  <Translate contentKey="adminApp.recorderCategoryLabel.authorityAttach">Authority Attach</Translate>
                </th>
                <th>
                  <Translate contentKey="adminApp.recorderCategoryLabel.record">Record</Translate>
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {categoryLabelList.map((categoryLabel, i) => (
                <tr key={`entity-${i}`} data-cy="entityTable">
                  <td>
                    <Button tag={Link} to={`${match.url}/${categoryLabel.id}`} color="link" size="sm">
                      {categoryLabel.id}
                    </Button>
                  </td>
                  <td>{categoryLabel.name}</td>
                  <td>{categoryLabel.description}</td>
                  <td>{categoryLabel.authorityAttach}</td>
                  <td>
                    {categoryLabel.records
                      ? categoryLabel.records.map((val, j) => (
                          <span key={j}>
                            <Link to={`record/${val.id}`}>{val.id}</Link>
                            {j === categoryLabel.records.length - 1 ? '' : ', '}
                          </span>
                        ))
                      : null}
                  </td>
                  <td className="text-right">
                    <div className="btn-group flex-btn-group-container">
                      <Button tag={Link} to={`${match.url}/${categoryLabel.id}`} color="info" size="sm" data-cy="entityDetailsButton">
                        <FontAwesomeIcon icon="eye" />{' '}
                        <span className="d-none d-md-inline">
                          <Translate contentKey="entity.action.view">View</Translate>
                        </span>
                      </Button>
                      <Button tag={Link} to={`${match.url}/${categoryLabel.id}/edit`} color="primary" size="sm" data-cy="entityEditButton">
                        <FontAwesomeIcon icon="pencil-alt" />{' '}
                        <span className="d-none d-md-inline">
                          <Translate contentKey="entity.action.edit">Edit</Translate>
                        </span>
                      </Button>
                      <Button
                        tag={Link}
                        to={`${match.url}/${categoryLabel.id}/delete`}
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
              <Translate contentKey="adminApp.recorderCategoryLabel.home.notFound">No Category Labels found</Translate>
            </div>
          )
        )}
      </div>
    </div>
  );
};

const mapStateToProps = ({ categoryLabel }: IRootState) => ({
  categoryLabelList: categoryLabel.entities,
  loading: categoryLabel.loading,
});

const mapDispatchToProps = {
  getEntities,
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(CategoryLabel);
