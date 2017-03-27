import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { hashHistory } from 'react-router';

import HealthModal from './health-modal';

export class Health extends Component {

  static propTypes = {
    isAuthenticated: PropTypes.bool.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      showModal: false
    };
  }

  componentWillMount() {
    this.setState({
      showModal: true
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      showModal: !nextProps.isAuthenticated
    });
  }

  handleClose = () => {
    this.setState({ showModal: false });
    hashHistory.push('/admin/health');
  };

  render() {
    return (
      <HealthModal showModal={this.state.showModal} handleClose={this.handleClose} health={this.props.health} />
    );
  }
}

export default connect(({ administration }) => ({ health: administration.health, isFetching: administration.isFetching }))(Health);
