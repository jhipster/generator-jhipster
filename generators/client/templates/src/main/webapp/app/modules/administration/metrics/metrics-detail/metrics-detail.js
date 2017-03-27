import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { hashHistory } from 'react-router';

import MetricsModal from './metrics-modal';

export class Metrics extends Component {

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
    hashHistory.push('/admin/metrics');
  };

  render() {
    return (
      <MetricsModal showModal={this.state.showModal} handleClose={this.handleClose} threadDump={this.props.threadDump} />
    );
  }
}

export default connect(({ administration }) => ({ threadDump: administration.threadDump, isFetching: administration.isFetching }))(Metrics);
