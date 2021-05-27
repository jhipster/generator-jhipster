import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Col, Row, Table } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootState } from 'app/shared/reducers';
import { getEntities } from './search-label.reducer';
import { ISearchLabel } from 'app/shared/model/recorder/search-label.model';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

export interface ISearchLabelProps extends StateProps, DispatchProps, RouteComponentProps<{ url: string }> {}

export const SearchLabel = (props: ISearchLabelProps) => {
  useEffect(() => {
    props.getEntities();
  }, []);

  const handleSyncList = () => {
    props.getEntities();
  };

  const { searchLabelList, match, loading } = props;
  return (
    <div>
      <h2 id="search-label-heading" data-cy="SearchLabelHeading">
        <Translate contentKey="adminApp.recorderSearchLabel.home.title">Search Labels</Translate>
        <div className="d-flex justify-content-end">
          <Button className="mr-2" color="info" onClick={handleSyncList} disabled={loading}>
            <FontAwesomeIcon icon="sync" spin={loading} />{' '}
            <Translate contentKey="adminApp.recorderSearchLabel.home.refreshListLabel">Refresh List</Translate>
          </Button>
          <Link to={`${match.url}/new`} className="btn btn-primary jh-create-entity" id="jh-create-entity" data-cy="entityCreateButton">
            <FontAwesomeIcon icon="plus" />
            &nbsp;
            <Translate contentKey="adminApp.recorderSearchLabel.home.createLabel">Create new Search Label</Translate>
          </Link>
        </div>
      </h2>
      <div className="table-responsive">
        {searchLabelList && searchLabelList.length > 0 ? (
          <Table responsive>
            <thead>
              <tr>
                <th>
                  <Translate contentKey="adminApp.recorderSearchLabel.id">ID</Translate>
                </th>
                <th>
                  <Translate contentKey="adminApp.recorderSearchLabel.name">Name</Translate>
                </th>
                <th>
                  <Translate contentKey="adminApp.recorderSearchLabel.description">Description</Translate>
                </th>
                <th>
                  <Translate contentKey="adminApp.recorderSearchLabel.records">Records</Translate>
                </th>
                <th>
                  <Translate contentKey="adminApp.recorderSearchLabel.userProfile">User Profile</Translate>
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {searchLabelList.map((searchLabel, i) => (
                <tr key={`entity-${i}`} data-cy="entityTable">
                  <td>
                    <Button tag={Link} to={`${match.url}/${searchLabel.id}`} color="link" size="sm">
                      {searchLabel.id}
                    </Button>
                  </td>
                  <td>{searchLabel.name}</td>
                  <td>{searchLabel.description}</td>
                  <td>
                    {searchLabel.records
                      ? searchLabel.records.map((val, j) => (
                          <span key={j}>
                            <Link to={`record/${val.id}`}>{val.id}</Link>
                            {j === searchLabel.records.length - 1 ? '' : ', '}
                          </span>
                        ))
                      : null}
                  </td>
                  <td>
                    {searchLabel.userProfile ? (
                      <Link to={`user-profile/${searchLabel.userProfile.id}`}>{searchLabel.userProfile.id}</Link>
                    ) : (
                      ''
                    )}
                  </td>
                  <td className="text-right">
                    <div className="btn-group flex-btn-group-container">
                      <Button tag={Link} to={`${match.url}/${searchLabel.id}`} color="info" size="sm" data-cy="entityDetailsButton">
                        <FontAwesomeIcon icon="eye" />{' '}
                        <span className="d-none d-md-inline">
                          <Translate contentKey="entity.action.view">View</Translate>
                        </span>
                      </Button>
                      <Button tag={Link} to={`${match.url}/${searchLabel.id}/edit`} color="primary" size="sm" data-cy="entityEditButton">
                        <FontAwesomeIcon icon="pencil-alt" />{' '}
                        <span className="d-none d-md-inline">
                          <Translate contentKey="entity.action.edit">Edit</Translate>
                        </span>
                      </Button>
                      <Button tag={Link} to={`${match.url}/${searchLabel.id}/delete`} color="danger" size="sm" data-cy="entityDeleteButton">
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
              <Translate contentKey="adminApp.recorderSearchLabel.home.notFound">No Search Labels found</Translate>
            </div>
          )
        )}
      </div>
    </div>
  );
};

const mapStateToProps = ({ searchLabel }: IRootState) => ({
  searchLabelList: searchLabel.entities,
  loading: searchLabel.loading,
});

const mapDispatchToProps = {
  getEntities,
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(SearchLabel);
