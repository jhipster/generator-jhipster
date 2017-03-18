export const LoginRoute = {
  path: 'login',
  getComponent(nextState, cb) {
    require.ensure([], (require) => {
      cb(null, require('./Login'));
    });
  }
};

export const LogoutRoute = {
  path: 'logout',
  onEnter(onLogout) {
    onLogout();
  },
  getComponent(nextState, cb) {
    require.ensure([], (require) => {
      cb(null, require('./Login'));
    });
  }
};
