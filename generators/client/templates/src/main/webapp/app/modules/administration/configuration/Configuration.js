import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getConfigurations, getEnv } from '../../reducers/administration';

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
    const { configuration, isFetching } = this.props;
    const configProps = (configuration && configuration.configProps) ? configuration.configProps : {};
    const env = (configuration && configuration.env) ? configuration.env : {};
    return (
      <div className="well">
        <div>
          <h2 translate="configuration.title">Configuration</h2>
          FIX ME add configuration datatable and filter
          <hr />
          <div className="row">
            <div className="col-sm-10">
              {JSON.stringify(configProps)}
            </div>
            <hr />
            <div className="col-sm-10">
              {JSON.stringify(env)}
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
