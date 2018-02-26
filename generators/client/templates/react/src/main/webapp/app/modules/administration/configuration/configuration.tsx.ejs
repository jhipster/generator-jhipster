import * as React from 'react';
import { connect } from 'react-redux';
import { Table, Input } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { sortBy, reverse } from 'lodash';

import { getConfigurations, getEnv } from '../../../reducers/administration';

export interface IConfigurationPageProps {
  isFetching?: boolean;
  getConfigurations: Function;
  getEnv: Function;
  configuration: any;
}

export interface IConfigurationPageState {
  filter: string;
  reversePrefix: boolean;
  reverseProperties: boolean;
}

export class ConfigurationPage extends React.Component<IConfigurationPageProps, IConfigurationPageState> {

  constructor(props) {
    super(props);
    this.state = {
      filter: '',
      reversePrefix: false,
      reverseProperties: false
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

  sortPrefix = (configProps, rev) => {
    const { configuration } = this.props;
    if (configuration && configuration.configProps) {
      const listSorted = sortBy(configProps, [ prop => configuration.configProps[prop].prefix ]);
      return rev ? reverse(listSorted) : listSorted;
    }
  }

  sortProperties = (configProps, rev) => {
    const { configuration } = this.props;
    if (configuration && configuration.configProps) {
      const listSorted = sortBy(configProps);
      return rev ? reverse(listSorted) : listSorted;
    }
  }

  reversePrefix = () => {
    this.setState({
      reversePrefix: !this.state.reversePrefix
    });
  }

  reverseProperties = () => {
    this.setState({
      reverseProperties: !this.state.reverseProperties
    });
  }

  render() {
    const { configuration } = this.props;
    const { filter, reversePrefix, reverseProperties } = this.state;
    const configProps = (configuration && configuration.configProps) ? configuration.configProps : {};
    const env = (configuration && configuration.env) ? configuration.env : {};
    return (
        <div>
          <h2><Translate contentKey="configuration.title">Configuration</Translate></h2>
          <span>
            <Translate contentKey="configuration.filter">Filter</Translate>
          </span> <Input type="search" value={filter} onChange={this.setFilter} name="search" id="search" />
          <label>Spring configuration</label>
          <Table className="table table-striped table-bordered table-responsive d-table">
            <thead>
              <tr>
                <th onClick={this.reversePrefix}><Translate contentKey="configuration.table.prefix">Prefix</Translate></th>
                <th onClick={this.reverseProperties}><Translate contentKey="configuration.table.properties">Properties</Translate></th>
              </tr>
            </thead>
            <tbody>
              {this.sortPrefix(Object.keys(configProps), reversePrefix).filter(this.filterFn).map((configPropKey, configPropIndex) => (
                <tr key={configPropIndex}>
                  <td><span>{configProps[configPropKey].prefix}</span></td>
                  <td>
                    {this.sortProperties(Object.keys(configProps[configPropKey].properties), reverseProperties).map((propKey, propIndex) => (
                      <div key={propIndex} className="row">
                        <div className="col-md-4">{propKey}</div>
                        <div className="col-md-8">
                            <span className="float-right badge badge-secondary break">{JSON.stringify(configProps[configPropKey].properties[propKey])}</span>
                        </div>
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {Object.keys(env).map((envKey, envIndex) => (
            <div key={envIndex}>
              <label><span>{envKey}</span></label>
              <Table className="table table-sm table-striped table-bordered table-responsive d-table">
                <thead>
                  <tr key={envIndex}>
                    <th className="w-40">Property</th>
                    <th className="w-60">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {env[envKey] ?
                    Object.keys(env[envKey]).filter(this.filterFn).map((propKey, propIndex) => (
                      <tr key={propIndex}>
                        <td className="break">{propKey}</td>
                        <td className="break">
                          <span className="float-right badge badge-secondary break">
                            {JSON.stringify(env[envKey][propKey])}
                          </span>
                        </td>
                      </tr>
                    ))
                  : ''}
                </tbody>
              </Table>
            </div>
          ))}
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
