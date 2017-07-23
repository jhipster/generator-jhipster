/* tslint:disable */ // TODO Fix when page is completed
import * as React from 'react';
import { connect } from 'react-redux';
import Translate from 'react-translate-component';

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

      <div className="well ng-scope">
        <div className="table-responsive">
          <h2>Logs</h2>
          <p>There are { loggers.length } loggers.</p>

          <span>Filter</span>
          <input type="text" className="form-control" disabled={isFetching} />

          <table className="table table-condensed table-striped table-bordered" >
            <thead>
              <tr title="click to order">
                <th><span>Name</span></th>
                <th><span>Level</span></th>
              </tr>
            </thead>
            <tbody>
              {
              loggers.map((logger, i) =>
                <tr>
                  <td><small>{logger.name}</small></td>
                  <td>
                    <button disabled={isFetching} onClick={() => this.changeLevel(logger.name, 'TRACE')} className={`btn btn-default btn-xs ${(logger.level === 'TRACE') ? 'btn-danger' : 'btn-default'}`}>TRACE</button>
                    <button disabled={isFetching} onClick={() => this.changeLevel(logger.name, 'DEBUG')} className={`btn btn-default btn-xs ${(logger.level === 'DEBUG') ? 'btn-warning' : 'btn-default'}`}>DEBUG</button>
                    <button disabled={isFetching} onClick={() => this.changeLevel(logger.name, 'INFO')} className={`btn btn-default btn-xs ${(logger.level === 'INFO') ? 'btn-info' : 'btn-default'}`}>INFO</button>
                    <button disabled={isFetching} onClick={() => this.changeLevel(logger.name, 'WARN')} className={`btn btn-default btn-xs ${(logger.level === 'WARN') ? 'btn-success' : 'btn-default'}`}>WARN</button>
                    <button disabled={isFetching} onClick={() => this.changeLevel(logger.name, 'ERROR')} className={`btn btn-default btn-xs ${(logger.level === 'WARN') ? 'btn-primary' : 'btn-default'}`}>ERROR</button>
                  </td>
                </tr>
              )
            }
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default connect(
  ({ administration }) => ({ logs: administration.logs, isFetching: administration.isFetching }),
  { getLoggers, changeLogLevel }
)(LogsPage);
