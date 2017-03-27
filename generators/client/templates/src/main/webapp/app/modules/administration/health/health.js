import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, hashHistory } from 'react-router';
import Translate from 'react-translate-component';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import { NavigationRefresh, ImageRemoveRedEye } from 'material-ui/svg-icons';

import { systemHealth, systemHealthInfo } from '../../../reducers/administration';

export class HealthPage extends Component {

  constructor(props) {
    super(props);
    this.getSystemHealth = this.getSystemHealth.bind(this);
    this.getSystemHealthInfo = this.getSystemHealthInfo.bind(this);
    this.transformHealthData = this.transformHealthData.bind(this);
  }

  componentDidMount() {
    this.props.systemHealth();
  }

  getSystemHealth() {
    if (!this.props.isFetching) {
      this.props.systemHealth();
    }
  }

  getSystemHealthInfo(healthObject) {
    this.props.systemHealthInfo(healthObject);
    hashHistory.push('/admin/health-detail');
  }

  getModuleName(path, name) {
    let result;
    if (path && name) {
      result = path + this.separator + name;
    } else if (path) {
      result = path;
    } else if (name) {
      result = name;
    } else {
      result = '';
    }
    return result;
  }

  addHealthObject(result, isLeaf, healthObject, name) {
    let status;
    let error;
    const healthData = {
      name,
      error,
      status
    };
    const details = {};
    let hasDetails = false;

    Object.keys(healthObject).forEach((key) => {
      if (healthObject[key]) {
        const value = healthObject[key];
        if (key === 'status' || key === 'error') {
          healthData[key] = value;
        } else {
          if (!this.isHealthObject(value)) {
            details[key] = value;
            hasDetails = true;
          }
        }
      }
    });
    // Add the details
    if (hasDetails) {
      healthData.details = details;
    }
    // Only add nodes if they provide additional information
    if (isLeaf || hasDetails || healthData.error) {
      result.push(healthData);
    }
    return healthData;
  }

  flattenHealthData(result, path, data): any {
    Object.keys(data).forEach((key) => {
      if (data[key]) {
        const value = data[key];
        if (this.isHealthObject(value)) {
          if (this.hasSubSystem(value)) {
            this.addHealthObject(result, false, value, this.getModuleName(path, key));
            this.flattenHealthData(result, this.getModuleName(path, key), value);
          } else {
            this.addHealthObject(result, true, value, this.getModuleName(path, key));
          }
        }
      }
    });
    return result;
  }

  transformHealthData(data) {
    const response = [];
    this.flattenHealthData(response, null, data);
    return response;
  }

  getBaseName(name) {
    if (name) {
      const split = name.split('.');
      return split[0];
    }
    return '';
  }

  getSubSystemName() {
    if (this.name) {
      const split = this.name.split('.');
      split.splice(0, 1);
      const remainder = split.join('.');
      return remainder ? ` - ${remainder}` : '';
    }
    return '';
  }

  hasSubSystem(healthObject) {
    let result = false;
    Object.keys(healthObject).forEach((key) => {
      if (healthObject[key]) {
        const value = healthObject[key];
        if (value && value.status) {
          result = true;
        }
      }
    });
    return result;
  }

  isHealthObject(healthObject) {
    let result = false;
    Object.keys(healthObject).forEach((key) => {
      if (healthObject[key]) {
        if (key === 'status') {
          result = true;
        }
      }
    });
    return result;
  }

  render() {
    const { health, isFetching } = this.props;
    const showCheckboxes = false;
    const data = this.transformHealthData(health) || {};
    return (
      <div className="well">
        <div>
          <h2 translate="health.title">Health Checks</h2>
          <p>
            <RaisedButton
              label={<Translate content="health.refresh.button" />}
              onClick={() => this.getSystemHealth()} primary
              disabled={isFetching} icon={<NavigationRefresh />}
            />
          </p>
          <hr />
          <div className="row">
            <div className="col-sm-12">
              <Table>
                <TableHeader
                  displaySelectAll={showCheckboxes}
                  adjustForCheckbox={showCheckboxes}
                >
                  <TableRow>
                    <TableHeaderColumn>ServiceName</TableHeaderColumn>
                    <TableHeaderColumn>Status</TableHeaderColumn>
                    <TableHeaderColumn>Details</TableHeaderColumn>
                  </TableRow>
                </TableHeader>
                <TableBody displayRowCheckbox={showCheckboxes}>
                  {data.map((row, index) => (
                    <TableRow key={index}>
                      <TableRowColumn>{row.name}</TableRowColumn>
                      <TableRowColumn>
                        <RaisedButton
                          label={row.status}
                          primary={row.status === 'UP'}
                          secondary={row.status !== 'UP'}
                        />
                      </TableRowColumn>
                      <TableRowColumn>
                        <FlatButton
                          icon={<ImageRemoveRedEye />}
                          onClick={() => this.getSystemHealthInfo(row)}
                        />
                      </TableRowColumn>
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
  ({ administration }) => ({ health: administration.health, isFetching: administration.isFetching }),
  { systemHealth, systemHealthInfo }
)(HealthPage);
