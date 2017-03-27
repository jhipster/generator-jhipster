import React, { Component, PropTypes } from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import Translate from 'react-translate-component';

import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';

class MetricsModal extends Component {

  static propTypes = {
    handleClose: PropTypes.func.isRequired,
    showModal: PropTypes.bool.isRequired
  };

  constructor(props, context) {
    super(props, context);
  }

  render() {
    const { handleClose, threadDump } = this.props;
    const showCheckboxes = false;
    // FIX show / hide stacktrace function & filter & Labels
    const actions = [
      <FlatButton
        label={<Translate content="entity.action.cancel" />}
        onTouchTap={handleClose}
      />
    ];
    return (
      <Dialog
        title={<h3><Translate content="metrics.title" /></h3>}
        actions={actions}
        modal autoScrollBodyContent
        open={this.props.showModal}
        onRequestClose={handleClose}
      >
        <div className="container">
          {threadDump.map(threadDumpInfo => (
            <div>
              <h5>{threadDumpInfo.threadState} {threadDumpInfo.threadName} (ID {threadDumpInfo.threadId})</h5>
              <FlatButton
                label="Show StackTrace"
                onTouchTap={() => this.setState({ showStack: !this.state.showStack })}
              />
              <div className="row" >
                <div className="col-md-12">
                  {Object.keys(threadDumpInfo.stackTrace).map((stK, stV) => (
                    <p>
                      {threadDumpInfo.stackTrace[stK].className}.{threadDumpInfo.stackTrace[stK].methodName}
                      ({threadDumpInfo.stackTrace[stK].fileName}:{threadDumpInfo.stackTrace[stK].lineNumber})
                    </p>
                  ))}
                </div>
              </div>
              <div className="row">
                <div className="col-md-12">
                  <Table>
                    <TableHeader
                      displaySelectAll={showCheckboxes}
                      adjustForCheckbox={showCheckboxes}
                    >
                      <TableRow>
                        <TableHeaderColumn>Blocked Time</TableHeaderColumn>
                        <TableHeaderColumn>Blocked Count</TableHeaderColumn>
                        <TableHeaderColumn>Waited Time</TableHeaderColumn>
                        <TableHeaderColumn>Waited Count</TableHeaderColumn>
                        <TableHeaderColumn>Lock Name</TableHeaderColumn>
                      </TableRow>
                    </TableHeader>
                    <TableBody displayRowCheckbox={showCheckboxes}>
                      <TableRow key={threadDumpInfo}>
                        <TableRowColumn>{threadDumpInfo.blockedTime}</TableRowColumn>
                        <TableRowColumn>{threadDumpInfo.blockedCount}</TableRowColumn>
                        <TableRowColumn>{threadDumpInfo.waitedTime}</TableRowColumn>
                        <TableRowColumn>{threadDumpInfo.waitedCount}</TableRowColumn>
                        <TableRowColumn>{threadDumpInfo.lockName}</TableRowColumn>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Dialog>
    );
  }
}

export default MetricsModal;
