import React, { Component } from 'react';
import { connect } from 'react-redux';
import { hashHistory } from 'react-router';
import LinearProgress from 'material-ui/LinearProgress';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import { NavigationRefresh, ImageRemoveRedEye } from 'material-ui/svg-icons';
import Translate from 'react-translate-component';
import { systemMetrics, systemThreadDump } from '../../../reducers/administration';

export class MetricsPage extends Component {

  constructor(props) {
    super(props);
    this.getMetrics = this.getMetrics.bind(this);
    this.getStats = this.getStats.bind(this);
    this.getThreadDump = this.getThreadDump.bind(this);
  }

  componentDidMount() {
    this.props.systemMetrics();
  }

  getMetrics() {
    if (!this.props.isFetching) {
      this.props.systemMetrics();
    }
  }

  getThreadDump() {
    this.props.systemThreadDump();
    hashHistory.push('/admin/metrics-detail');
  }

  getStats(metrics) {
    const stat = {
      servicesStats: {},
      cachesStats: {}
    };
    if (!this.props.isFetching && metrics) {
      Object.keys(metrics.timers).forEach((key, indexNm) => {
        if (key.indexOf('web.rest') !== -1 || key.indexOf('service') !== -1) {
          stat.servicesStats[key] = metrics.timers[key];
        }
        if (key.indexOf('net.sf.ehcache.Cache') !== -1) {
          // remove gets or puts
          const index = key.lastIndexOf('.');
          const newKey = key.substr(0, index);
          // Keep the name of the domain
          stat.cachesStats[newKey] = {
            name: newKey,
            value: metrics.timers[key]
          };
        }
      });
      return stat;
    }
  }

  render() {
    const showCheckboxes = false;
    const { metrics, isFetching } = this.props;
    const data = metrics || {};
    const { servicesStats, cachesStats } = this.getStats(data);
    return (
      <div className="well">
        <div>
          <h2 translate="metrics.title">Application Metrics</h2>
          <p>
            <RaisedButton
              label={<Translate content="metrics.refresh.button" />}
              onClick={() => this.getMetrics()} primary
              disabled={isFetching} icon={<NavigationRefresh />}
            />
          </p>
          FIX ME Coloring the progressbar
          <hr />
          <div className="row">
            <div className="col-sm-12">
              <h3>JVM Metrics</h3>
              <div className="row">
                <div className="col-md-4">
                  <b>Memory</b>
                  <p>
                    <span>Total Memory</span>
                    ({metrics.gauges['jvm.memory.total.used'].value / 1000000 || 0}M / {metrics.gauges['jvm.memory.total.max'].value / 1000000 || 0}M)
                  </p>
                  <LinearProgress
                    mode="determinate"
                    value={metrics.gauges['jvm.memory.total.used'].value}
                    min="0"
                    max={metrics.gauges['jvm.memory.total.max'].value}
                  />
                  <span>{((metrics.gauges['jvm.memory.total.used'].value * 100) / metrics.gauges['jvm.memory.total.max'].value) || 0}%</span>

                  <p>
                    <span>Heap Memory</span>
                    ({metrics.gauges['jvm.memory.heap.used'].value / 1000000 || 0}M / {metrics.gauges['jvm.memory.heap.max'].value / 1000000 || 0}M)
                  </p>
                  <LinearProgress
                    mode="determinate"
                    min="0"
                    max={metrics.gauges['jvm.memory.heap.max'].value}
                    value={metrics.gauges['jvm.memory.heap.used'].value}
                  />
                  <span>{((metrics.gauges['jvm.memory.heap.used'].value * 100) / metrics.gauges['jvm.memory.heap.max'].value) || 0}%</span>

                  <p>
                    <span>Non-Heap Memory</span>
                    ({metrics.gauges['jvm.memory.non-heap.used'].value / 1000000 || 0}M / {metrics.gauges['jvm.memory.non-heap.committed'].value / 1000000 || 0}M)
                  </p>
                  <LinearProgress
                    mode="determinate"
                    min="0"
                    max={metrics.gauges['jvm.memory.non-heap.committed'].value}
                    value={metrics.gauges['jvm.memory.non-heap.used'].value}
                  />
                  <span>{((metrics.gauges['jvm.memory.non-heap.used'].value * 100) / metrics.gauges['jvm.memory.non-heap.committed'].value) || 0}%</span>
                </div>
                <div className="col-md-4">
                  <b>Threads</b> (Total: {metrics.gauges['jvm.threads.count'].value})
                  <FlatButton
                    icon={<ImageRemoveRedEye />}
                    onClick={() => this.getThreadDump()}
                  />
                  <p><span>Runnable</span> {metrics.gauges['jvm.threads.runnable.count'].value}</p>
                  <LinearProgress mode="determinate" min="0" value={metrics.gauges['jvm.threads.runnable.count'].value} max={metrics.gauges['jvm.threads.count'].value} />
                  <span>{((metrics.gauges['jvm.threads.runnable.count'].value * 100) / metrics.gauges['jvm.threads.count'].value) || 0}%</span>

                  <p><span>Timed Waiting</span> ({metrics.gauges['jvm.threads.timed_waiting.count'].value})</p>
                  <LinearProgress mode="determinate" min="0" value={metrics.gauges['jvm.threads.timed_waiting.count'].value} max={metrics.gauges['jvm.threads.count'].value} />
                  <span>{((metrics.gauges['jvm.threads.timed_waiting.count'].value * 100) / metrics.gauges['jvm.threads.count'].value) || 0}%</span>

                  <p><span>Waiting</span> ({metrics.gauges['jvm.threads.waiting.count'].value})</p>
                  <LinearProgress mode="determinate" min="0" value={metrics.gauges['jvm.threads.waiting.count'].value} max={metrics.gauges['jvm.threads.count'].value} />
                  <span>{((metrics.gauges['jvm.threads.waiting.count'].value * 100) / metrics.gauges['jvm.threads.count'].value) || 0}%</span>

                  <p><span>Blocked</span> ({metrics.gauges['jvm.threads.blocked.count'].value})</p>
                  <LinearProgress mode="determinate" min="0" value={metrics.gauges['jvm.threads.blocked.count'].value} max={metrics.gauges['jvm.threads.count'].value} />
                  <span>{((metrics.gauges['jvm.threads.blocked.count'].value * 100) / metrics.gauges['jvm.threads.count'].value) || 0}%</span>
                </div>
                <div className="col-md-4">
                  <b>Garbage collections</b>
                  <div className="row">
                    <div className="col-md-9">Mark Sweep count</div>
                    <div className="col-md-3 text-right">{metrics.gauges['jvm.garbage.PS-MarkSweep.count'].value}</div>
                  </div>
                  <div className="row">
                    <div className="col-md-9">Mark Sweep time</div>
                    <div className="col-md-3 text-right">{metrics.gauges['jvm.garbage.PS-MarkSweep.time'].value}ms</div>
                  </div>
                  <div className="row">
                    <div className="col-md-9">Scavenge count</div>
                    <div className="col-md-3 text-right">{metrics.gauges['jvm.garbage.PS-Scavenge.count'].value}</div>
                  </div>
                  <div className="row">
                    <div className="col-md-9">Scavenge time</div>
                    <div className="col-md-3 text-right">{metrics.gauges['jvm.garbage.PS-Scavenge.time'].value}ms</div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-sm-12">
                  <h3>HTTP requests (events per second)</h3>
                  <p>
                    <span>Active requests</span>
                    <b>{metrics.counters['com.codahale.metrics.servlet.InstrumentedFilter.activeRequests'].count || 0}</b> -
                    <span>Total requests</span> <b>{metrics.timers['com.codahale.metrics.servlet.InstrumentedFilter.requests'].count || 0}</b>
                  </p>
                  <Table>
                    <TableHeader
                      displaySelectAll={showCheckboxes}
                      adjustForCheckbox={showCheckboxes}
                    >
                      <TableRow>
                        <TableHeaderColumn>Code</TableHeaderColumn>
                        <TableHeaderColumn>Count</TableHeaderColumn>
                        <TableHeaderColumn>Mean</TableHeaderColumn>
                        <TableHeaderColumn><span>Average</span> (1 min)</TableHeaderColumn>
                        <TableHeaderColumn><span>Average</span> (5 min)</TableHeaderColumn>
                        <TableHeaderColumn><span>Average</span> (15 min)</TableHeaderColumn>
                      </TableRow>
                    </TableHeader>
                    <TableBody displayRowCheckbox={showCheckboxes}>
                      <TableRow key={0}>
                        <TableRowColumn>OK</TableRowColumn>
                        <TableRowColumn>
                          <LinearProgress
                            mode="determinate"
                            min="0"
                            max={metrics.timers['com.codahale.metrics.servlet.InstrumentedFilter.requests'].count}
                            value={metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.ok'].count}
                          />
                        </TableRowColumn>
                        <TableRowColumn>
                          {metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.ok'].mean_rate || 2}
                        </TableRowColumn>
                        <TableRowColumn>
                          {metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.ok'].m1_rate || 2}
                        </TableRowColumn>
                        <TableRowColumn>
                          {metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.ok'].m5_rate || 2}
                        </TableRowColumn>
                        <TableRowColumn>
                          {metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.ok'].m15_rate || 2}
                        </TableRowColumn>
                      </TableRow>
                      <TableRow key={1}>
                        <TableRowColumn>Not Found</TableRowColumn>
                        <TableRowColumn>
                          <LinearProgress
                            mode="determinate"
                            min="0"
                            max={metrics.timers['com.codahale.metrics.servlet.InstrumentedFilter.requests'].count}
                            value={metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.notFound'].count}
                          />
                        </TableRowColumn>
                        <TableRowColumn>
                          {metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.notFound'].mean_rate || 2}
                        </TableRowColumn>
                        <TableRowColumn>
                          {metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.notFound'].m1_rate || 2}
                        </TableRowColumn>
                        <TableRowColumn>
                          {metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.notFound'].m5_rate || 2}
                        </TableRowColumn>
                        <TableRowColumn>
                          {metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.notFound'].m15_rate || 2}
                        </TableRowColumn>
                      </TableRow>
                      <TableRow key={2}>
                        <TableRowColumn>Server Error</TableRowColumn>
                        <TableRowColumn>
                          <LinearProgress
                            mode="determinate"
                            min="0"
                            max={metrics.timers['com.codahale.metrics.servlet.InstrumentedFilter.requests'].count}
                            value={metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.serverError'].count}
                          />
                        </TableRowColumn>
                        <TableRowColumn>
                          {metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.serverError'].mean_rate || 2}
                        </TableRowColumn>
                        <TableRowColumn>
                          {metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.serverError'].m1_rate || 2}
                        </TableRowColumn>
                        <TableRowColumn>
                          {metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.serverError'].m5_rate || 2}
                        </TableRowColumn>
                        <TableRowColumn>
                          {metrics.meters['com.codahale.metrics.servlet.InstrumentedFilter.responseCodes.serverError'].m15_rate || 2}
                        </TableRowColumn>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="row">
                <div className="col-sm-12">
                  <h3>Services statistics (time in millisecond)</h3>
                  <Table>
                    <TableHeader
                      displaySelectAll={showCheckboxes}
                      adjustForCheckbox={showCheckboxes}
                    >
                      <TableRow>
                        <TableHeaderColumn>Name</TableHeaderColumn>
                        <TableHeaderColumn>Count</TableHeaderColumn>
                        <TableHeaderColumn>Mean</TableHeaderColumn>
                        <TableHeaderColumn>Min</TableHeaderColumn>
                        <TableHeaderColumn>p50</TableHeaderColumn>
                        <TableHeaderColumn>p75</TableHeaderColumn>
                        <TableHeaderColumn>p95</TableHeaderColumn>
                        <TableHeaderColumn>p99</TableHeaderColumn>
                        <TableHeaderColumn>Max</TableHeaderColumn>
                      </TableRow>
                    </TableHeader>
                    <TableBody displayRowCheckbox={showCheckboxes}>
                      {Object.keys(servicesStats).map((key, index) => (
                        <TableRow key={key}>
                          <TableRowColumn>{key}</TableRowColumn>
                          <TableRowColumn>{servicesStats[key].count}</TableRowColumn>
                          <TableRowColumn>{servicesStats[key].mean * 1000 || 0}</TableRowColumn>
                          <TableRowColumn>{servicesStats[key].min * 1000 || 0}</TableRowColumn>
                          <TableRowColumn>{servicesStats[key].p50 * 1000 || 0}</TableRowColumn>
                          <TableRowColumn>{servicesStats[key].p75 * 1000 || 0}</TableRowColumn>
                          <TableRowColumn>{servicesStats[key].p95 * 1000 || 0}</TableRowColumn>
                          <TableRowColumn>{servicesStats[key].p99 * 1000 || 0}</TableRowColumn>
                          <TableRowColumn>{servicesStats[key].max * 1000 || 0}</TableRowColumn>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              <div className="row">
                <div className="col-sm-12">
                  <h3>Ehcache statistics</h3>
                  <Table>
                    <TableHeader
                      displaySelectAll={showCheckboxes}
                      adjustForCheckbox={showCheckboxes}
                    >
                      <TableRow>
                        <TableHeaderColumn>Cache Name</TableHeaderColumn>
                        <TableHeaderColumn>Object</TableHeaderColumn>
                        <TableHeaderColumn>Misses</TableHeaderColumn>
                        <TableHeaderColumn>Eviction Count</TableHeaderColumn>
                      </TableRow>
                    </TableHeader>
                    <TableBody displayRowCheckbox={showCheckboxes}>
                      {Object.keys(cachesStats).map((k, v) => (
                        <TableRow key={k}>
                          <TableRowColumn>{cachesStats.k.name}</TableRowColumn>
                          <TableRowColumn>{metrics.gauges[`${k}.objects`].value}</TableRowColumn>
                          <TableRowColumn>{metrics.gauges[`${k}.hits`].value}</TableRowColumn>
                          <TableRowColumn>{metrics.gauges[`${k}.misses`].value}</TableRowColumn>
                          <TableRowColumn>{metrics.gauges[`${k}.eviction-count`].value}</TableRowColumn>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              { metrics.gauges['HikariPool-1.pool.TotalConnections'].value > 0 ?
                <div className="row">
                  <div className="col-sm-12">
                    <h3>DataSource statistics (time in millisecond)</h3>
                    <Table>
                      <TableHeader
                        displaySelectAll={showCheckboxes}
                        adjustForCheckbox={showCheckboxes}
                      >
                        <TableRow>
                          <TableHeaderColumn>
                            <span>Usage</span>
                            ({metrics.gauges['HikariPool-1.pool.ActiveConnections'].value} / {metrics.gauges['HikariPool-1.pool.TotalConnections'].value})
                          </TableHeaderColumn>
                          <TableHeaderColumn>Count</TableHeaderColumn>
                          <TableHeaderColumn>Mean</TableHeaderColumn>
                          <TableHeaderColumn>Min</TableHeaderColumn>
                          <TableHeaderColumn>p50</TableHeaderColumn>
                          <TableHeaderColumn>p75</TableHeaderColumn>
                          <TableHeaderColumn>p95</TableHeaderColumn>
                          <TableHeaderColumn>p99</TableHeaderColumn>
                          <TableHeaderColumn>Max</TableHeaderColumn>
                        </TableRow>
                      </TableHeader>
                      <TableBody displayRowCheckbox={showCheckboxes}>
                        <TableRow key="DB">
                          <TableRowColumn>
                            <LinearProgress
                              mode="determinate"
                              min="0"
                              max={metrics.gauges['HikariPool-1.pool.TotalConnections'].value}
                              value={metrics.gauges['HikariPool-1.pool.ActiveConnections'].value}
                            />
                            <span>{((metrics.gauges['HikariPool-1.pool.ActiveConnections'].value * 100) / metrics.gauges['HikariPool-1.pool.TotalConnections'].value) || 0}%</span>
                          </TableRowColumn>
                          <TableRowColumn>{metrics.histograms['HikariPool-1.pool.Usage'].count}</TableRowColumn>
                          <TableRowColumn>{metrics.histograms['HikariPool-1.pool.Usage'].mean * 1000 || 0}</TableRowColumn>
                          <TableRowColumn>{metrics.histograms['HikariPool-1.pool.Usage'].min * 1000 || 0}</TableRowColumn>
                          <TableRowColumn>{metrics.histograms['HikariPool-1.pool.Usage'].p50 * 1000 || 0}</TableRowColumn>
                          <TableRowColumn>{metrics.histograms['HikariPool-1.pool.Usage'].p75 * 1000 || 0}</TableRowColumn>
                          <TableRowColumn>{metrics.histograms['HikariPool-1.pool.Usage'].p95 * 1000 || 0}</TableRowColumn>
                          <TableRowColumn>{metrics.histograms['HikariPool-1.pool.Usage'].p99 * 1000 || 0}</TableRowColumn>
                          <TableRowColumn>{metrics.histograms['HikariPool-1.pool.Usage'].max * 1000 || 0}</TableRowColumn>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              : null }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  ({ administration }) => ({ metrics: administration.metrics, isFetching: administration.isFetching }),
  { systemMetrics, systemThreadDump }
)(MetricsPage);
