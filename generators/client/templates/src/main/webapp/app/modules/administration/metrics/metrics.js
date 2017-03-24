import React, { Component } from 'react';
import { connect } from 'react-redux';

import Translate from 'react-translate-component';
import { systemMetrics } from '../../../reducers/administration';

export class MetricsPage extends Component {

  constructor(props) {
    super(props);
    this.getMetrics = this.getMetrics.bind(this);
  }

  componentDidMount() {
    this.props.systemMetrics();
  }

  getMetrics() {
    if (!this.props.isFetching) {
      this.props.systemMetrics();
    }
  }

  render() {
    const { metrics, isFetching } = this.props;
    const data = metrics || {};
    return (
      <div className="well">
        <div>
          <h2 translate="metrics.title">Application Metrics</h2>
          <p>
            <button type="button" onClick={() => this.getMetrics()} className={isFetching ? 'btn btn-danger' : 'btn btn-primary'} disabled={isFetching}>
              <span className="glyphicon glyphicon-refresh" />&nbsp;
              <Translate component="span" content="health.refresh.button" />
            </button>
          </p>
          FIX ME
          <hr />
          <div className="row">
            <div className="col-sm-10">
              {JSON.stringify(data)}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  ({ administration }) => ({ metrics: administration.metrics, isFetching: administration.isFetching }),
  { systemMetrics }
)(MetricsPage);
