import * as React from 'react';
import { connect } from 'react-redux';

import { Table } from 'reactstrap';

import { getAudits } from '../../../reducers/administration';

export interface IAuditsPageProps {
  isFetching?: boolean;
  audits: any[];
  getAudits: Function;
}

export class AuditsPage extends React.Component<IAuditsPageProps, undefined> {

  componentDidMount() {
    this.props.getAudits();
  }

  getAuditList = () => {
    if (!this.props.isFetching) {
      this.props.getAudits();
    }
  }

  render() {
    const { audits } = this.props;
    return (
      <div>
          <h2>Audits</h2>
          FIX ME pagination and filter by date and sorting
          <hr/>
          <div className="row">
            <div className="col-12">
              <Table>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Principal</th>
                    <th>Address</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {audits.map((row, index) => (
                    <tr key={index}>
                      <tr>{row.timestamp}</tr>
                      <tr>{row.principal}</tr>
                      <tr>{row.data.remoteAddress}</tr>
                      <tr>{row.type}</tr>
                    </tr>
                  ))}
                </tbody>
              </Table>
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
