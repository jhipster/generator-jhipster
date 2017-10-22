import * as React from 'react';
import { Table, Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

export default class MetricsModal extends React.Component<any, any> {
  constructor(props) {
    super(props);
  }

  render() {
    const { handleClose, showModal, threadDump } = this.props;
    return (
      <Modal isOpen={showModal} modalTransition={{ timeout: 20 }} backdropTransition={{ timeout: 10 }}
      toggle={handleClose} className="modal-lg">
      <ModalHeader toggle={handleClose}>Thread Dump Info</ModalHeader>
      <ModalBody>
      {threadDump ? threadDump.map(threadDumpInfo => (
        <div>
            <h5>{threadDumpInfo.threadState} {threadDumpInfo.threadName} (ID {threadDumpInfo.threadId})</h5>
            <div className="row" >
              <div className="col-xs-12">
                {Object.keys(threadDumpInfo.stackTrace).map((stK, stV) => (
                  <p>
                    {threadDumpInfo.stackTrace[stK].className}.{threadDumpInfo.stackTrace[stK].methodName}
                    ({threadDumpInfo.stackTrace[stK].fileName}:{threadDumpInfo.stackTrace[stK].lineNumber})
                  </p>
                ))}
              </div>
            </div>
            <div className="row">
              <div className="col-xs-12">
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Blocked Time</th>
                      <th>Blocked Count</th>
                      <th>Waited Time</th>
                      <th>Waited Count</th>
                      <th>Lock Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr key={threadDumpInfo}>
                      <td>{threadDumpInfo.blockedTime}</td>
                      <td>{threadDumpInfo.blockedCount}</td>
                      <td>{threadDumpInfo.waitedTime}</td>
                      <td>{threadDumpInfo.waitedCount}</td>
                      <td>{threadDumpInfo.lockName}</td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </div>
        </div>
        )
      ) : '' }
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleClose}>Close</Button>
      </ModalFooter>
    </Modal>
    );
  }
}
