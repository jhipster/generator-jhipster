import React, { Component, PropTypes } from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import Translate from 'react-translate-component';

import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';

class HealthModal extends Component {

  static propTypes = {
    handleClose: PropTypes.func.isRequired,
    showModal: PropTypes.bool.isRequired
  };

  constructor(props, context) {
    super(props, context);
  }

  render() {
    const { handleClose, health } = this.props;
    const showCheckboxes = false;
    const actions = [
      <FlatButton
        label={<Translate content="entity.action.cancel" />}
        onTouchTap={handleClose}
      />
    ];
    return (
      <Dialog
        title={<h3><Translate content="health.title" /></h3>}
        actions={actions}
        modal autoScrollBodyContent
        open={this.props.showModal}
        onRequestClose={handleClose}
      >
        <h4>{health.name}</h4>
        <div className="row">
          <div className="col-md-12">
            <Table>
              <TableHeader
                displaySelectAll={showCheckboxes}
                adjustForCheckbox={showCheckboxes}
              >
                <TableRow>
                  <TableHeaderColumn>Name</TableHeaderColumn>
                  <TableHeaderColumn>Value</TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody displayRowCheckbox={showCheckboxes}>
                {Object.keys(health.details).map((key, index) => (
                  <TableRow key={index}>
                    <TableRowColumn>{key}</TableRowColumn>
                    <TableRowColumn>{health.details[key]}</TableRowColumn>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </Dialog>
    );
  }
}

export default HealthModal;
