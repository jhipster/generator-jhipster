import axios from 'axios';
import { ICrudGetAction, ICrudPutAction, ICrudDeleteAction } from 'react-jhipster';

import { REQUEST, SUCCESS, FAILURE } from './action-type.util';
import { messages } from '../config/constants';

export const ACTION_TYPES = {
  FETCH_NOTIFICATIONS: 'notification/FETCH_NOTIFICATIONS',
  CREATE_NOTIFICATION: 'notification/CREATE_NOTIFICATION',
  UPDATE_NOTIFICATION: 'notification/UPDATE_NOTIFICATION',
  DELETE_NOTIFICATION: 'notification/DELETE_NOTIFICATION'
};

const initialState = {
  notifications: []
};

// Reducer

export default (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.FETCH_NOTIFICATIONS:
      return {
        ...state
      };
    case ACTION_TYPES.CREATE_NOTIFICATION:
    case ACTION_TYPES.UPDATE_NOTIFICATION:
    case ACTION_TYPES.DELETE_NOTIFICATION:
      return {
        ...state,
        notifications: [ ...state.notifications, { message: action.meta.successMessage, visible: true } ]
      };
    default:
      return state;
  }
};

// Actions

export const getNotifications: ICrudGetAction = () => ({
  type: ACTION_TYPES.FETCH_NOTIFICATIONS
});

export const createNotification: ICrudPutAction = () => {
  const result = ({
    type: ACTION_TYPES.CREATE_NOTIFICATION,
    meta: {
      successMessage: messages.DATA_CREATE_SUCCESS_ALERT,
      errorMessage: messages.DATA_CREATE_ERROR_ALERT
    }
  });
  return result;
};

export const updateNotification: ICrudPutAction = () => {
  const result = ({
    type: ACTION_TYPES.UPDATE_NOTIFICATION,
    meta: {
      successMessage: messages.DATA_UPDATE_SUCCESS_ALERT,
      errorMessage: messages.DATA_UPDATE_ERROR_ALERT
    }
  });
  return result;
};

export const deleteNotification: ICrudPutAction = () => {
  const result = ({
    type: ACTION_TYPES.DELETE_NOTIFICATION,
    meta: {
      successMessage: messages.DATA_DELETE_SUCCESS_ALERT,
      errorMessage: messages.DATA_DELETE_ERROR_ALERT
    }
  });
  return result;
};
