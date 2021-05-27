import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, Label } from 'reactstrap';
import { AvFeedback, AvForm, AvGroup, AvInput, AvField } from 'availity-reactstrap-validation';
import { Translate, translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootState } from 'app/shared/reducers';

import { IRecord } from 'app/shared/model/recorder/record.model';
import { getEntities as getRecords } from 'app/entities/recorder/record/record.reducer';
import { IUserProfile } from 'app/shared/model/recorder/user-profile.model';
import { getEntities as getUserProfiles } from 'app/entities/recorder/user-profile/user-profile.reducer';
import { getEntity, updateEntity, createEntity, reset } from './search-label.reducer';
import { ISearchLabel } from 'app/shared/model/recorder/search-label.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface ISearchLabelUpdateProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export const SearchLabelUpdate = (props: ISearchLabelUpdateProps) => {
  const [idsrecords, setIdsrecords] = useState([]);
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const { searchLabelEntity, records, userProfiles, loading, updating } = props;

  const handleClose = () => {
    props.history.push('/search-label');
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getRecords();
    props.getUserProfiles();
  }, []);

  useEffect(() => {
    if (props.updateSuccess) {
      handleClose();
    }
  }, [props.updateSuccess]);

  const saveEntity = (event, errors, values) => {
    if (errors.length === 0) {
      const entity = {
        ...searchLabelEntity,
        ...values,
        records: mapIdList(values.records),
        userProfile: userProfiles.find(it => it.id.toString() === values.userProfileId.toString()),
      };

      if (isNew) {
        props.createEntity(entity);
      } else {
        props.updateEntity(entity);
      }
    }
  };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="adminApp.recorderSearchLabel.home.createOrEditLabel" data-cy="SearchLabelCreateUpdateHeading">
            <Translate contentKey="adminApp.recorderSearchLabel.home.createOrEditLabel">Create or edit a SearchLabel</Translate>
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <AvForm model={isNew ? {} : searchLabelEntity} onSubmit={saveEntity}>
              {!isNew ? (
                <AvGroup>
                  <Label for="search-label-id">
                    <Translate contentKey="global.field.id">ID</Translate>
                  </Label>
                  <AvInput id="search-label-id" type="text" className="form-control" name="id" required readOnly />
                </AvGroup>
              ) : null}
              <AvGroup>
                <Label id="nameLabel" for="search-label-name">
                  <Translate contentKey="adminApp.recorderSearchLabel.name">Name</Translate>
                </Label>
                <AvField
                  id="search-label-name"
                  data-cy="name"
                  type="text"
                  name="name"
                  validate={{
                    required: { value: true, errorMessage: translate('entity.validation.required') },
                  }}
                />
              </AvGroup>
              <AvGroup>
                <Label id="descriptionLabel" for="search-label-description">
                  <Translate contentKey="adminApp.recorderSearchLabel.description">Description</Translate>
                </Label>
                <AvField id="search-label-description" data-cy="description" type="text" name="description" />
              </AvGroup>
              <AvGroup>
                <Label for="search-label-records">
                  <Translate contentKey="adminApp.recorderSearchLabel.records">Records</Translate>
                </Label>
                <AvInput
                  id="search-label-records"
                  data-cy="records"
                  type="select"
                  multiple
                  className="form-control"
                  name="records"
                  value={!isNew && searchLabelEntity.records && searchLabelEntity.records.map(e => e.id)}
                >
                  <option value="" key="0" />
                  {records
                    ? records.map(otherEntity => (
                        <option value={otherEntity.id} key={otherEntity.id}>
                          {otherEntity.id}
                        </option>
                      ))
                    : null}
                </AvInput>
              </AvGroup>
              <AvGroup>
                <Label for="search-label-userProfile">
                  <Translate contentKey="adminApp.recorderSearchLabel.userProfile">User Profile</Translate>
                </Label>
                <AvInput id="search-label-userProfile" data-cy="userProfile" type="select" className="form-control" name="userProfileId">
                  <option value="" key="0" />
                  {userProfiles
                    ? userProfiles.map(otherEntity => (
                        <option value={otherEntity.id} key={otherEntity.id}>
                          {otherEntity.id}
                        </option>
                      ))
                    : null}
                </AvInput>
              </AvGroup>
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/search-label" replace color="info">
                <FontAwesomeIcon icon="arrow-left" />
                &nbsp;
                <span className="d-none d-md-inline">
                  <Translate contentKey="entity.action.back">Back</Translate>
                </span>
              </Button>
              &nbsp;
              <Button color="primary" id="save-entity" data-cy="entityCreateSaveButton" type="submit" disabled={updating}>
                <FontAwesomeIcon icon="save" />
                &nbsp;
                <Translate contentKey="entity.action.save">Save</Translate>
              </Button>
            </AvForm>
          )}
        </Col>
      </Row>
    </div>
  );
};

const mapStateToProps = (storeState: IRootState) => ({
  records: storeState.record.entities,
  userProfiles: storeState.userProfile.entities,
  searchLabelEntity: storeState.searchLabel.entity,
  loading: storeState.searchLabel.loading,
  updating: storeState.searchLabel.updating,
  updateSuccess: storeState.searchLabel.updateSuccess,
});

const mapDispatchToProps = {
  getRecords,
  getUserProfiles,
  getEntity,
  updateEntity,
  createEntity,
  reset,
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(SearchLabelUpdate);
