/* eslint-disable */ // TODO Fix when page is completed
import * as React from 'react';
import { connect } from 'react-redux';

import Translate from 'react-translate-component';
import { systemMetrics } from '../../../reducers/administration';

export interface IMetricsPageProps {
  isFetching?: boolean;
  systemMetrics: Function;
  metrics: any;
}

export class MetricsPage extends React.Component<IMetricsPageProps, undefined> {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.systemMetrics();
  }

  getMetrics = () => {
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
          <h2>Application Metrics</h2>
          <p>
            <button type="button" onClick={this.getMetrics} className={isFetching ? 'btn btn-danger' : 'btn btn-primary'} disabled={isFetching}>
              <span className="glyphicon glyphicon-refresh" />&nbsp;
              <Translate component="span" content="health.refresh.button" />
            </button>
          </p>
          FIX ME
          <hr />
          <div className="row">
            <div className="col-10">
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
