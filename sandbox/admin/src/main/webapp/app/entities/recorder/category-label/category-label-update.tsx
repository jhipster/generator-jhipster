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
import { getEntity, updateEntity, createEntity, reset } from './category-label.reducer';
import { ICategoryLabel } from 'app/shared/model/recorder/category-label.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface ICategoryLabelUpdateProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export const CategoryLabelUpdate = (props: ICategoryLabelUpdateProps) => {
  const [idsrecord, setIdsrecord] = useState([]);
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const { categoryLabelEntity, records, userProfiles, loading, updating } = props;

  const handleClose = () => {
    props.history.push('/category-label');
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
        ...categoryLabelEntity,
        ...values,
        records: mapIdList(values.records),
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
          <h2 id="adminApp.recorderCategoryLabel.home.createOrEditLabel" data-cy="CategoryLabelCreateUpdateHeading">
            <Translate contentKey="adminApp.recorderCategoryLabel.home.createOrEditLabel">Create or edit a CategoryLabel</Translate>
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <AvForm model={isNew ? {} : categoryLabelEntity} onSubmit={saveEntity}>
              {!isNew ? (
                <AvGroup>
                  <Label for="category-label-id">
                    <Translate contentKey="global.field.id">ID</Translate>
                  </Label>
                  <AvInput id="category-label-id" type="text" className="form-control" name="id" required readOnly />
                </AvGroup>
              ) : null}
              <AvGroup>
                <Label id="nameLabel" for="category-label-name">
                  <Translate contentKey="adminApp.recorderCategoryLabel.name">Name</Translate>
                </Label>
                <AvField
                  id="category-label-name"
                  data-cy="name"
                  type="text"
                  name="name"
                  validate={{
                    required: { value: true, errorMessage: translate('entity.validation.required') },
                  }}
                />
              </AvGroup>
              <AvGroup>
                <Label id="descriptionLabel" for="category-label-description">
                  <Translate contentKey="adminApp.recorderCategoryLabel.description">Description</Translate>
                </Label>
                <AvField
                  id="category-label-description"
                  data-cy="description"
                  type="text"
                  name="description"
                  validate={{
                    required: { value: true, errorMessage: translate('entity.validation.required') },
                  }}
                />
              </AvGroup>
              <AvGroup>
                <Label id="authorityAttachLabel" for="category-label-authorityAttach">
                  <Translate contentKey="adminApp.recorderCategoryLabel.authorityAttach">Authority Attach</Translate>
                </Label>
                <AvField
                  id="category-label-authorityAttach"
                  data-cy="authorityAttach"
                  type="text"
                  name="authorityAttach"
                  validate={{
                    required: { value: true, errorMessage: translate('entity.validation.required') },
                  }}
                />
              </AvGroup>
              <AvGroup>
                <Label for="category-label-record">
                  <Translate contentKey="adminApp.recorderCategoryLabel.record">Record</Translate>
                </Label>
                <AvInput
                  id="category-label-record"
                  data-cy="record"
                  type="select"
                  multiple
                  className="form-control"
                  name="records"
                  value={!isNew && categoryLabelEntity.records && categoryLabelEntity.records.map(e => e.id)}
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
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/category-label" replace color="info">
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
  categoryLabelEntity: storeState.categoryLabel.entity,
  loading: storeState.categoryLabel.loading,
  updating: storeState.categoryLabel.updating,
  updateSuccess: storeState.categoryLabel.updateSuccess,
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

export default connect(mapStateToProps, mapDispatchToProps)(CategoryLabelUpdate);
