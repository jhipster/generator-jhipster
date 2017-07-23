/**
 * Appends REQUEST asyc action type
 */

export const REQUEST = actionType => `${actionType}_PENDING`;

/**
 * Appends SUCCESS asyc action type
 */

export const SUCCESS = actionType => `${actionType}_FULFILLED`;

/**
 * Appends FAILURE asyc action type
 */

export const FAILURE = actionType => `${actionType}_REJECTED`;
