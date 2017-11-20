/* tslint:disable */ // TODO Fix when page is completed
import * as React from 'react';
import { connect } from 'react-redux';
import { Translate } from 'react-jhipster';

import { getLoggers, changeLogLevel } from '../../../reducers/administration';

export interface ILogsPageProps {
  isFetching?: boolean,
  getLoggers: Function,
  changeLogLevel: Function,
  logs: any
};

export class LogsPage extends React.Component<ILogsPageProps, undefined> {

  constructor(props) {
    super(props);
    this.getLogs = this.getLogs.bind(this);
    this.changeLevel = this.changeLevel.bind(this);
  }

  componentDidMount() {
    this.props.getLoggers();
  }

  getLogs() {
    if (!this.props.isFetching) {
      this.props.getLoggers();
    }
  }

  changeLevel(loggerName, level) {
    this.props.changeLogLevel(loggerName, level);
  }

  render() {
    const { logs, isFetching } = this.props;
    const loggers = logs ? logs.loggers : {};
    return (
        <div>
          <h2>Logs</h2>
          <p>There are { loggers.length } loggers.</p>

          <span>Filter</span>
          <input type="text" className="form-control" disabled={isFetching} />

          <table className="table table-sm table-striped table-bordered" >
            <thead>
              <tr title="click to order">
                <th><span>Name</span></th>
                <th><span>Level</span></th>
              </tr>
            </thead>
            <tbody>
              {
              loggers.map((logger, i) =>
                <tr key={`log-row-${i}`}>
                  <td><small>{logger.name}</small></td>
                  <td>
                    <button disabled={isFetching} onClick={() => this.changeLevel(logger.name, 'TRACE')} className={`btn btn-secondary btn-sm ${(logger.level === 'TRACE') ? 'btn-danger' : 'btn-secondary'}`}>TRACE</button>
                    <button disabled={isFetching} onClick={() => this.changeLevel(logger.name, 'DEBUG')} className={`btn btn-secondary btn-sm ${(logger.level === 'DEBUG') ? 'btn-warning' : 'btn-secondary'}`}>DEBUG</button>
                    <button disabled={isFetching} onClick={() => this.changeLevel(logger.name, 'INFO')} className={`btn btn-secondary btn-sm ${(logger.level === 'INFO') ? 'btn-info' : 'btn-secondary'}`}>INFO</button>
                    <button disabled={isFetching} onClick={() => this.changeLevel(logger.name, 'WARN')} className={`btn btn-secondary btn-sm ${(logger.level === 'WARN') ? 'btn-success' : 'btn-secondary'}`}>WARN</button>
                    <button disabled={isFetching} onClick={() => this.changeLevel(logger.name, 'ERROR')} className={`btn btn-secondary btn-sm ${(logger.level === 'WARN') ? 'btn-primary' : 'btn-secondary'}`}>ERROR</button>
                  </td>
                </tr>
              )
            }
            </tbody>
          </table>
        </div>
    );
  }
}

export default connect(
  ({ administration }) => ({ logs: administration.logs, isFetching: administration.isFetching }),
  { getLoggers, changeLogLevel }
)(LogsPage);
