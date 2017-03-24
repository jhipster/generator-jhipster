import React, { Component } from 'react';
import { connect } from 'react-redux';
import Translate from 'react-translate-component';

import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';

import { getAudits } from '../../../reducers/administration';

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
    const showCheckboxes = false;
    const { audits, isFetching } = this.props;
    return (
      <div className="well">
        <div>
          <h2 translate="audits.title">Audits</h2>
          FIX ME pagination and filter by date and sorting
          <hr />
          <div className="row">
            <div className="col-sm-12">
              <Table>
                <TableHeader
                  displaySelectAll={showCheckboxes}
                  adjustForCheckbox={showCheckboxes}>
                  <TableRow>
                    <TableHeaderColumn>Timestamp</TableHeaderColumn>
                    <TableHeaderColumn>Principal</TableHeaderColumn>
                    <TableHeaderColumn>Address</TableHeaderColumn>
                    <TableHeaderColumn>Type</TableHeaderColumn>
                  </TableRow>
                </TableHeader>
                <TableBody displayRowCheckbox={showCheckboxes}>
                  {audits.map((row, index) => (
                    <TableRow key={index}>
                      <TableRowColumn>{row.timestamp}</TableRowColumn>
                      <TableRowColumn>{row.principal}</TableRowColumn>
                      <TableRowColumn>{row.data.remoteAddress}</TableRowColumn>
                      <TableRowColumn>{row.type}</TableRowColumn>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
