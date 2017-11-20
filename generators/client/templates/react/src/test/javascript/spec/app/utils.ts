// A dirty way to remove functions and undefined from an object for comparison
export const cleanupObj = obj => JSON.parse(JSON.stringify(obj));
