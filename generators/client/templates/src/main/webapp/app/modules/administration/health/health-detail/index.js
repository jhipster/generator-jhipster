export const HealthRoute = {
  path: 'admin/health-detail',
  getComponent(nextState, cb) {
    require.ensure([], (require) => {
      cb(null, require('./health-detail'));
    });
  }
};
