const enableLog = true;

export const log = (msg, data = '') => {
  if (enableLog) console.info(msg, data);
};

export const error = (msg, data = '') => {
  if (enableLog) console.error(msg, data);
};
