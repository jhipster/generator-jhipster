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

export class ConfigurationPage extends React.Component<IConfigurationPageProps, { filter: string }> {

  constructor(props) {
    super(props);
    this.state = {
      filter: ''
    };
  }

  componentDidMount() {
    this.props.getConfigurations();
    this.props.getEnv();
  }

  getConfigurationList = () => {
    if (!this.props.isFetching) {
      this.props.getConfigurations();
      this.props.getEnv();
    }
  }

  setFilter = evt => {
    this.setState({
      filter: evt.target.value
    });
  }

  filterFn = prefix => prefix.toUpperCase().includes(this.state.filter.toUpperCase());

  render() {
    const { configuration } = this.props;
    const { filter } = this.state;
    const configProps = (configuration && configuration.configProps) ? configuration.configProps : {};
    const env = (configuration && configuration.env) ? configuration.env : {};
    return (
        <div className="pad-20">
          <h2>Configuration</h2>
          <Input type="search" value={filter} onChange={this.setFilter} name="search" id="search" placeholder="Search by Prefix" />
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
                  {Object.keys(configProps).filter(this.filterFn).map((configPropKey, configPropIndex) => (
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
                            Object.keys(env[envKey]).filter(this.filterFn).map((propKey, propIndex) => (
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
    );
  }
}

const mapStateToProps = ({ administration }) => ({
  configuration: administration.configuration,
  isFetching: administration.isFetching
});

const mapDispatchToProps = { getConfigurations, getEnv };

export default connect(mapStateToProps, mapDispatchToProps)(ConfigurationPage);
