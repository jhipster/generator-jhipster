export default {
  /* Path not specified as this is the index route */
  getComponent(nextState, cb) {
    require.ensure([], (require) => {
      cb(null, require('./home').default);
    });
  }
};
