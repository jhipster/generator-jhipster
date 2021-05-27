import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'react-jhipster';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { INode, defaultValue } from 'app/shared/model/recorder/node.model';

export const ACTION_TYPES = {
  FETCH_NODE_LIST: 'node/FETCH_NODE_LIST',
  FETCH_NODE: 'node/FETCH_NODE',
  CREATE_NODE: 'node/CREATE_NODE',
  UPDATE_NODE: 'node/UPDATE_NODE',
  PARTIAL_UPDATE_NODE: 'node/PARTIAL_UPDATE_NODE',
  DELETE_NODE: 'node/DELETE_NODE',
  RESET: 'node/RESET',
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<INode>,
  entity: defaultValue,
  updating: false,
  updateSuccess: false,
};

export type NodeState = Readonly<typeof initialState>;

// Reducer

export default (state: NodeState = initialState, action): NodeState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_NODE_LIST):
    case REQUEST(ACTION_TYPES.FETCH_NODE):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true,
      };
    case REQUEST(ACTION_TYPES.CREATE_NODE):
    case REQUEST(ACTION_TYPES.UPDATE_NODE):
    case REQUEST(ACTION_TYPES.DELETE_NODE):
    case REQUEST(ACTION_TYPES.PARTIAL_UPDATE_NODE):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true,
      };
    case FAILURE(ACTION_TYPES.FETCH_NODE_LIST):
    case FAILURE(ACTION_TYPES.FETCH_NODE):
    case FAILURE(ACTION_TYPES.CREATE_NODE):
    case FAILURE(ACTION_TYPES.UPDATE_NODE):
    case FAILURE(ACTION_TYPES.PARTIAL_UPDATE_NODE):
    case FAILURE(ACTION_TYPES.DELETE_NODE):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload,
      };
    case SUCCESS(ACTION_TYPES.FETCH_NODE_LIST):
      return {
        ...state,
        loading: false,
        entities: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.FETCH_NODE):
      return {
        ...state,
        loading: false,
        entity: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.CREATE_NODE):
    case SUCCESS(ACTION_TYPES.UPDATE_NODE):
    case SUCCESS(ACTION_TYPES.PARTIAL_UPDATE_NODE):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.DELETE_NODE):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: {},
      };
    case ACTION_TYPES.RESET:
      return {
        ...initialState,
      };
    default:
      return state;
  }
};

const apiUrl = 'services/recorder/api/nodes';

// Actions

export const getEntities: ICrudGetAllAction<INode> = (page, size, sort) => ({
  type: ACTION_TYPES.FETCH_NODE_LIST,
  payload: axios.get<INode>(`${apiUrl}?cacheBuster=${new Date().getTime()}`),
});

export const getEntity: ICrudGetAction<INode> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_NODE,
    payload: axios.get<INode>(requestUrl),
  };
};

export const createEntity: ICrudPutAction<INode> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_NODE,
    payload: axios.post(apiUrl, cleanEntity(entity)),
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<INode> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_NODE,
    payload: axios.put(`${apiUrl}/${entity.id}`, cleanEntity(entity)),
  });
  return result;
};

export const partialUpdate: ICrudPutAction<INode> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.PARTIAL_UPDATE_NODE,
    payload: axios.patch(`${apiUrl}/${entity.id}`, cleanEntity(entity)),
  });
  return result;
};

export const deleteEntity: ICrudDeleteAction<INode> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_NODE,
    payload: axios.delete(requestUrl),
  });
  dispatch(getEntities());
  return result;
};

export const reset = () => ({
  type: ACTION_TYPES.RESET,
});
