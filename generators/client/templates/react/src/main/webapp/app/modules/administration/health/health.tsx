/* eslint-disable */ // TODO Fix when page is completed
import * as React from 'react';
import { connect } from 'react-redux';
import Translate from 'react-translate-component';

import { systemHealth } from '../../../reducers/administration';

export interface IHealthPageProps {
  isFetching?: boolean;
  systemHealth: Function;
  health: any;
}

export class HealthPage extends React.Component<IHealthPageProps, undefined> {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.systemHealth();
  }

  getSystemHealth = () => {
    if (!this.props.isFetching) {
      this.props.systemHealth();
    }
  }

  render() {
    const { health, isFetching } = this.props;
    const data = health || {};
    return (
      <div className="well">
        <div>
          <h2>Health Checks</h2>
          <p>
            <button type="button" onClick={this.getSystemHealth} className={isFetching ? 'btn btn-danger' : 'btn btn-primary'} disabled={isFetching}>
              <span className="glyphicon glyphicon-refresh" />&nbsp;
              <Translate component="span" content="health.refresh.button" />
            </button>
          </p>
          FIX ME datatable
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
  ({ administration }) => ({ health: administration.health, isFetching: administration.isFetching }),
  { systemHealth }
)(HealthPage);
