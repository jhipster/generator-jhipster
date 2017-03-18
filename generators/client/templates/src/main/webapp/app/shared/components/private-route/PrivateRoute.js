import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { redirectToLoginWithMessage, getSession } from '../../../reducers/authentication';

const mapStateToProps = state => ({
  loading: state.authentication.loading,
  isAuthenticated: state.authentication.isAuthenticated
});
const mapDispatchToProps = {
  redirectToLoginWithMessage,
  getSession
};

const privateRoute = Wrapped => connect(mapStateToProps, mapDispatchToProps)(class extends React.Component {
  static propTypes = {
    getSession: PropTypes.func.isRequired,
    redirectToLoginWithMessage: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    isAuthenticated: PropTypes.bool.isRequired
  }

  componentDidMount() {
    this.props.getSession();
    this.redirectIfNotLogged(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.redirectIfNotLogged(nextProps);
  }

  redirectIfNotLogged(props) {
    const { loading, isAuthenticated } = props;
    if (loading === false && !isAuthenticated) {
      this.props.redirectToLoginWithMessage('login.messages.error.authentication');
    }
  }

  render() {
    const { loading, isAuthenticated } = this.props;
    if (loading || !isAuthenticated) {
      return (
        <div className="center loader">
          <div>Loading...</div>
        </div>
      );
    }

    return <Wrapped {...this.props} />;
  }
});

export default privateRoute;
