export const MetricsRoute = {
  path: 'admin/metrics-detail',
  getComponent(nextState, cb) {
    require.ensure([], (require) => {
      cb(null, require('./metrics-detail'));
    });
  }
};
