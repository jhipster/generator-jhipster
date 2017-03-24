import React, { Component } from 'react';
import { connect } from 'react-redux';
import Translate from 'react-translate-component';

import { systemHealth } from '../../../reducers/administration';

export class HealthPage extends Component {

  constructor(props) {
    super(props);
    this.getSystemHealth = this.getSystemHealth.bind(this);
  }

  componentDidMount() {
    this.props.systemHealth();
  }

  getSystemHealth() {
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
          <h2 translate="health.title">Health Checks</h2>
          <p>
            <button type="button" onClick={() => this.getSystemHealth()} className={isFetching ? 'btn btn-danger' : 'btn btn-primary'} disabled={isFetching}>
              <span className="glyphicon glyphicon-refresh" />&nbsp;
              <Translate component="span" content="health.refresh.button" />
            </button>
          </p>
          FIX ME datatable
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
  ({ administration }) => ({ health: administration.health, isFetching: administration.isFetching }),
  { systemHealth }
)(HealthPage);
