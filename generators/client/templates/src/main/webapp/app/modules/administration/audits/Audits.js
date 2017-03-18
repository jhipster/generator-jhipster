import React, { Component } from 'react';
import { connect } from 'react-redux';

import Translate from 'react-translate-component';
import { getAudits } from '../../reducers/administration';

export class AuditsPage extends Component {

  constructor(props) {
    super(props);
    this.getAuditList = this.getAuditList.bind(this);
  }

  componentDidMount() {
    this.props.getAudits();
  }

  getAuditList() {
    if (!this.props.isFetching) {
      this.props.getAudits();
    }
  }

  render() {
    const { audits, isFetching } = this.props;
    return (
      <div className="well">
        <div>
          <h2 translate="health.title">Audits</h2>
          <p>
            <button type="button" onClick={() => this.getAuditList()} className={isFetching ? 'btn btn-danger' : 'btn btn-primary'} disabled={isFetching}>
              <span className="glyphicon glyphicon-refresh" />&nbsp;
              <Translate component="span" content="health.refresh.button" />
            </button>
          </p>
          FIX ME datatable, pagination and filter by date
          <hr />
          <div className="row">
            <div className="col-sm-10">
              {JSON.stringify(audits)}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  ({ administration }) => ({ audits: administration.audits, isFetching: administration.isFetching }),
  { getAudits }
)(AuditsPage);
