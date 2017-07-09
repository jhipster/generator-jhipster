import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import TextField from 'material-ui/TextField';

import { getConfigurations, getEnv } from '../../../reducers/administration';

export class ConfigurationPage extends Component {

  constructor(props) {
    super(props);
    this.getConfigurationList = this.getConfigurationList.bind(this);
  }

  componentDidMount() {
    this.props.getConfigurations();
    this.props.getEnv();
  }

  getConfigurationList() {
    if (!this.props.isFetching) {
      this.props.getConfigurations();
      this.props.getEnv();
    }
  }

  render() {
    const showCheckboxes = false;
    const { configuration, isFetching } = this.props;
    const configProps = (configuration && configuration.configProps) ? configuration.configProps : {};
    const env = (configuration && configuration.env) ? configuration.env : {};
    return (
      <div className="well">
        <div>
          <h2 translate="configuration.title">Configuration</h2>
          FIX ME add search function
          <TextField hintText="Search by Prefix" fullWidth />
          <hr />
          <div className="row">
            <div className="col-sm-12">
              <Table>
                <TableHeader
                  displaySelectAll={showCheckboxes}
                  adjustForCheckbox={showCheckboxes}
                >
                  <TableRow>
                    <TableHeaderColumn>Prefix</TableHeaderColumn>
                    <TableHeaderColumn>Properties</TableHeaderColumn>
                  </TableRow>
                </TableHeader>
                <TableBody displayRowCheckbox={showCheckboxes}>
                  {Object.keys(configProps).map((configPropKey, configPropIndex) => (
                    <TableRow key={configPropIndex}>
                      <TableRowColumn>{configProps[configPropKey].prefix}</TableRowColumn>
                      <TableRowColumn>
                        {Object.keys(configProps[configPropKey].properties).map((propKey, propIndex) => (
                          <div>
                            <p>
                              <b> {propKey} </b>
                              {JSON.stringify(configProps[configPropKey].properties[propKey])}
                            </p>
                          </div>
                        ))}
                      </TableRowColumn>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <hr />
            <div className="col-sm-12">
              {Object.keys(env).map((envKey, envIndex) => (
                <div>
                  <h4> {envKey} </h4>
                  <Table>
                    <TableHeader
                      displaySelectAll={showCheckboxes}
                      adjustForCheckbox={showCheckboxes}
                    >
                      <TableRow key={envIndex}>
                        <TableHeaderColumn>Prefix</TableHeaderColumn>
                        <TableHeaderColumn>Properties</TableHeaderColumn>
                      </TableRow>
                    </TableHeader>
                    <TableBody displayRowCheckbox={showCheckboxes}>
                      {env[envKey] ?
                          typeof env[envKey] === 'object' ?
                            Object.keys(env[envKey]).map((propKey, propIndex) => (
                              <TableRow key={propIndex}>
                                <TableRowColumn>{propKey} </TableRowColumn>
                                <TableRowColumn>{JSON.stringify(env[envKey][propKey])}</TableRowColumn>
                              </TableRow>
                              ))
                            : (<TableRow key={envKey}>
                              {JSON.stringify(env[envKey])}
                            </TableRow>)
                      : ''}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  ({ administration }) => ({ configuration: administration.configuration, isFetching: administration.isFetching }),
  { getConfigurations, getEnv }
)(ConfigurationPage);
