import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Table, Input, Row, Col, Badge } from 'reactstrap';
import { Translate } from 'react-jhipster';

import { getConfigurations, getEnv } from '../administration.reducer';
import { IRootState } from 'app/shared/reducers';

export interface IConfigurationPageProps extends StateProps, DispatchProps {}

export const ConfigurationPage = (props: IConfigurationPageProps) => {
  const [filter, setFilter] = useState('');
  const [reversePrefix, setReversePrefix] = useState(false);
  const [reverseProperties, setReverseProperties] = useState(false);

  useEffect(() => {
    props.getConfigurations();
    props.getEnv();
  }, []);

  const changeFilter = evt => setFilter(evt.target.value);

  const envFilterFn = configProp => configProp.toUpperCase().includes(filter.toUpperCase());

  const propsFilterFn = configProp => configProp.prefix.toUpperCase().includes(filter.toUpperCase());

  const changeReversePrefix = () => setReversePrefix(!reversePrefix);

  const changeReverseProperties = () => setReverseProperties(!reverseProperties);

  const getContextList = contexts =>
    Object.values(contexts)
      .map((v: any) => v.beans)
      .reduce((acc, e) => ({ ...acc, ...e }));

  const { configuration } = props;

  const configProps = configuration && configuration.configProps ? configuration.configProps : {};

  const env = configuration && configuration.env ? configuration.env : {};

  return (
    <div>
      <h2 id="configuration-page-heading" data-cy="configurationPageHeading">
        <Translate contentKey="configuration.title">Configuration</Translate>
      </h2>
      <span>
        <Translate contentKey="configuration.filter">Filter</Translate>
      </span>{' '}
      <Input type="search" value={filter} onChange={changeFilter} name="search" id="search" />
      <label>Spring configuration</label>
      <Table className="table table-striped table-bordered table-responsive d-table">
        <thead>
          <tr>
            <th onClick={changeReversePrefix}>
              <Translate contentKey="configuration.table.prefix">Prefix</Translate>
            </th>
            <th onClick={changeReverseProperties}>
              <Translate contentKey="configuration.table.properties">Properties</Translate>
            </th>
          </tr>
        </thead>
        <tbody>
          {configProps.contexts
            ? Object.values(getContextList(configProps.contexts))
                .filter(propsFilterFn)
                .map((property: any, propIndex) => (
                  <tr key={propIndex}>
                    <td>{property['prefix']}</td>
                    <td>
                      {Object.keys(property['properties']).map((propKey, index) => (
                        <Row key={index}>
                          <Col md="4">{propKey}</Col>
                          <Col md="8">
                            <Badge className="float-right badge-secondary break">{JSON.stringify(property['properties'][propKey])}</Badge>
                          </Col>
                        </Row>
                      ))}
                    </td>
                  </tr>
                ))
            : null}
        </tbody>
      </Table>
      {env.propertySources
        ? env.propertySources.map((envKey, envIndex) => (
            <div key={envIndex}>
              <h4>
                <span>{envKey.name}</span>
              </h4>
              <Table className="table table-sm table-striped table-bordered table-responsive d-table">
                <thead>
                  <tr key={envIndex}>
                    <th className="w-40">Property</th>
                    <th className="w-60">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(envKey.properties)
                    .filter(envFilterFn)
                    .map((propKey, propIndex) => (
                      <tr key={propIndex}>
                        <td className="break">{propKey}</td>
                        <td className="break">
                          <span className="float-right badge badge-secondary break">{envKey.properties[propKey].value}</span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </div>
          ))
        : null}
    </div>
  );
};

const mapStateToProps = ({ administration }: IRootState) => ({
  configuration: administration.configuration,
  isFetching: administration.loading,
});

const mapDispatchToProps = { getConfigurations, getEnv };

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(ConfigurationPage);
