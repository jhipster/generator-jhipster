<%#
 Copyright 2013-2018 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see http://www.jhipster.tech/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
<%_
    let hasDate = false;
    if (fieldsContainInstant || fieldsContainZonedDateTime || fieldsContainLocalDate) {
        hasDate = true;
    }
    let entityActionName = entityInstance.toUpperCase();
    let entityActionNamePlural = entityInstancePlural.toUpperCase();
_%>
import axios from 'axios';
import { ICrudGetAction, ICrudPutAction, ICrudDeleteAction } from 'react-jhipster';

import { REQUEST, SUCCESS, FAILURE } from '../../reducers/action-type.util';
import { messages, SERVER_API_URL } from '../../config/constants';
<%_ if (!(applicationType === 'gateway' && locals.microserviceName) && authenticationType !== 'uaa') { _%>

<%_ } _%>
<%_ if (hasDate) { _%>
// import { JhiDateUtils } from 'ng-jhipster';
<%_ } _%>
// import { <%= entityAngularName %> } from './<%= entityFileName %>.model';

export const ACTION_TYPES = {
  FETCH_<%= entityActionNamePlural %>: '<%= entityInstance %>/FETCH_<%= entityActionNamePlural %>',
  <%_ if (searchEngine === 'elasticsearch') { _%>
  SEARCH_<%= entityActionNamePlural %>: '<%= entityInstance %>/SEARCH_<%= entityActionNamePlural %>',
  <%_ } _%>
  <%_ for (idx in relationships) {
    const relationshipFieldNamePlural = relationships[idx].relationshipFieldNamePlural;
    const otherEntityNamePlural = relationships[idx].otherEntityNamePlural;
   _%>
  FETCH_<%= otherEntityNamePlural %>: '<%= otherEntityNamePlural %>/FETCH_<%= otherEntityNamePlural %>',
  <%_ } _%>
  FETCH_<%= entityActionName %>:  '<%= entityInstance %>/FETCH_<%= entityActionName %>',
  CREATE_<%= entityActionName %>: '<%= entityInstance %>/CREATE_<%= entityActionName %>',
  UPDATE_<%= entityActionName %>: '<%= entityInstance %>/UPDATE_<%= entityActionName %>',
  DELETE_<%= entityActionName %>: '<%= entityInstance %>/DELETE_<%= entityActionName %>'
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [],
  entity: {},
<%_ for (idx in relationships) {
  const relationshipFieldNamePlural = relationships[idx].relationshipFieldNamePlural;
  const otherEntityNamePlural = relationships[idx].otherEntityNamePlural;
_%>
  <%= otherEntityNamePlural %>: [],
<%_ } _%>
  updating: false,
  updateSuccess: false
};

// Reducer
export default (state = initialState, action) => {
  switch (action.type) {
<%_ for (idx in relationships) {
    const relationshipFieldNamePlural = relationships[idx].relationshipFieldNamePlural;
    const otherEntityNamePlural = relationships[idx].otherEntityNamePlural;
_%>
    case REQUEST(ACTION_TYPES.FETCH_<%= otherEntityNamePlural %>):
<%_ } _%>
    case REQUEST(ACTION_TYPES.FETCH_<%= entityActionNamePlural %>):
    <%_ if (searchEngine === 'elasticsearch') { _%>
    case REQUEST(ACTION_TYPES.SEARCH_<%= entityActionNamePlural %>):
    <%_ } _%>
    case REQUEST(ACTION_TYPES.FETCH_<%= entityActionName %>):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true
      };
    case REQUEST(ACTION_TYPES.CREATE_<%= entityActionName %>):
    case REQUEST(ACTION_TYPES.UPDATE_<%= entityActionName %>):
    case REQUEST(ACTION_TYPES.DELETE_<%= entityActionName %>):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true
      };
<%_ for (idx in relationships) {
    const relationshipFieldNamePlural = relationships[idx].relationshipFieldNamePlural;
    const otherEntityNamePlural = relationships[idx].otherEntityNamePlural;
_%>
    case FAILURE(ACTION_TYPES.FETCH_<%= otherEntityNamePlural %>):
<%_ } _%>
    case FAILURE(ACTION_TYPES.FETCH_<%= entityActionNamePlural %>):
    <%_ if (searchEngine === 'elasticsearch') { _%>
    case FAILURE(ACTION_TYPES.SEARCH_<%= entityActionNamePlural %>):
    <%_ } _%>
    case FAILURE(ACTION_TYPES.FETCH_<%= entityActionName %>):
    case FAILURE(ACTION_TYPES.CREATE_<%= entityActionName %>):
    case FAILURE(ACTION_TYPES.UPDATE_<%= entityActionName %>):
    case FAILURE(ACTION_TYPES.DELETE_<%= entityActionName %>):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload
      };
<%_ for (idx in relationships) {
    const relationshipFieldNamePlural = relationships[idx].relationshipFieldNamePlural;
    const otherEntityNamePlural = relationships[idx].otherEntityNamePlural;
_%>
    case SUCCESS(ACTION_TYPES.FETCH_<%= otherEntityNamePlural %>):
      return {
        ...state,
        loading: false,
        <%= otherEntityNamePlural %>: action.payload.data
      };
<%_ } _%>
    case SUCCESS(ACTION_TYPES.FETCH_<%= entityActionNamePlural %>):
      return {
        ...state,
        loading: false,
        entities: action.payload.data
      };
    <%_ if (searchEngine === 'elasticsearch') { _%>
    case SUCCESS(ACTION_TYPES.SEARCH_<%= entityActionNamePlural %>):
      return {
        ...state,
        loading: false,
        entities: action.payload.data
    };
    <%_ } _%>
    case SUCCESS(ACTION_TYPES.FETCH_<%= entityActionName %>):
      return {
        ...state,
        loading: false,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.CREATE_<%= entityActionName %>):
    case SUCCESS(ACTION_TYPES.UPDATE_<%= entityActionName %>):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.DELETE_<%= entityActionName %>):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: {}
      };
    default:
      return state;
  }
};

const apiUrl = <% if (applicationType === 'gateway' && locals.microserviceName) { %>'/<%= microserviceName.toLowerCase() %>/<% } else if (authenticationType === 'uaa') { %>'<% } else { %>SERVER_API_URL + '<% } %>/api/<%= entityApiUrl %>';
<%_ if (searchEngine === 'elasticsearch') { _%>
const apiSearchUrl = <% if (applicationType === 'gateway' && locals.microserviceName) { %>'/<%= microserviceName.toLowerCase() %>/<% } else if (authenticationType === 'uaa') { %>'<% } else { %>SERVER_API_URL + '<% } %>/api/_search/<%= entityApiUrl %>';
<%_ } _%>

// Actions

<%_ for (idx in relationships) {
  const relationshipFieldNamePlural = relationships[idx].relationshipFieldNamePlural;
  const otherEntityNamePlural = relationships[idx].otherEntityNamePlural;
_%>
export const get<%= otherEntityNamePlural %>: ICrudGetAction = () => ({
  type: ACTION_TYPES.FETCH_<%= otherEntityNamePlural %>,
  payload: axios.get(`/api/<%= otherEntityNamePlural %>?cacheBuster=${new Date().getTime()}`)
});

<%_ } _%>
export const getEntities: ICrudGetAction = (page, size, sort) => ({
  type: ACTION_TYPES.FETCH_<%= entityActionNamePlural %>,
  payload: axios.get(`${apiUrl}?cacheBuster=${new Date().getTime()}`)
});
<%_ if (searchEngine === 'elasticsearch') { _%>

export const getSearchEntities: ICrudGetAction = query => ({
  type: ACTION_TYPES.SEARCH_<%= entityActionNamePlural %>,
  payload: axios.get(`${apiSearchUrl}?query=` + query)
});
<%_ } _%>

export const getEntity: ICrudGetAction = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_<%= entityActionName %>,
    payload: axios.get(requestUrl)
  };
};

export const createEntity: ICrudPutAction = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_<%= entityActionName %>,
    meta: {
      successMessage: messages.DATA_CREATE_SUCCESS_ALERT,
      errorMessage: messages.DATA_UPDATE_ERROR_ALERT
    },
    payload: axios.post(apiUrl, entity)
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_<%= entityActionName %>,
    meta: {
      successMessage: messages.DATA_CREATE_SUCCESS_ALERT,
      errorMessage: messages.DATA_UPDATE_ERROR_ALERT
    },
    payload: axios.put(apiUrl, entity)
  });
  dispatch(getEntities());
  return result;
};

export const deleteEntity: ICrudDeleteAction = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_<%= entityActionName %>,
    meta: {
      successMessage: messages.DATA_DELETE_SUCCESS_ALERT,
      errorMessage: messages.DATA_UPDATE_ERROR_ALERT
    },
    payload: axios.delete(requestUrl)
  });
  dispatch(getEntities());
  return result;
};
