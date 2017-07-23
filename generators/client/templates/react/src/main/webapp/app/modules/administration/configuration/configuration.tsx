/* eslint-disable */ // TODO Fix when page is completed
import * as React from 'react';
import { connect } from 'react-redux';
import { Table, Input } from 'reactstrap';

import { getConfigurations, getEnv } from '../../../reducers/administration';

export interface IConfigurationPageProps {
  isFetching?: boolean;
  getConfigurations: Function;
  getEnv: Function;
  configuration: any;
}

export class ConfigurationPage extends React.Component<IConfigurationPageProps, undefined> {

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
    const { configuration } = this.props;
    const configProps = (configuration && configuration.configProps) ? configuration.configProps : {};
    const env = (configuration && configuration.env) ? configuration.env : {};
    return (
      <div className="well">
        <div>
          <h2>Configuration</h2>
          FIX ME add search function
          <Input type="search" name="search" id="search" placeholder="Search by Prefix" />
          <hr />
          <div className="row">
            <div className="col-12">
              <Table>
                <thead
                >
                  <tr>
                    <th>Prefix</th>
                    <th>Properties</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(configProps).map((configPropKey, configPropIndex) => (
                    <tr key={configPropIndex}>
                      <td>{configProps[configPropKey].prefix}</td>
                      <td>
                        {Object.keys(configProps[configPropKey].properties).map((propKey, propIndex) => (
                          <div>
                            <p>
                              <b> {propKey} </b>
                              {JSON.stringify(configProps[configPropKey].properties[propKey])}
                            </p>
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            <hr />
            <div className="col-12">
              {Object.keys(env).map((envKey, envIndex) => (
                <div>
                  <h4> {envKey} </h4>
                  <Table>
                    <thead
                    >
                      <tr key={envIndex}>
                        <th>Prefix</th>
                        <th>Properties</th>
                      </tr>
                    </thead>
                    <tbody>
                      {env[envKey] ?
                          typeof env[envKey] === 'object' ?
                            Object.keys(env[envKey]).map((propKey, propIndex) => (
                              <tr key={propIndex}>
                                <td>{propKey} </td>
                                <td>{JSON.stringify(env[envKey][propKey])}</td>
                              </tr>
                              ))
                            : (<tr key={envKey}>
                              {JSON.stringify(env[envKey])}
                            </tr>)
                      : ''}
                    </tbody>
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
