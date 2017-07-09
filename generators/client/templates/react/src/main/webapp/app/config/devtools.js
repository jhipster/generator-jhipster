import React from 'react';
/* eslint-disable */
import { createDevTools } from 'redux-devtools';
import LogMonitor from 'redux-devtools-log-monitor';
import DockMonitor from 'redux-devtools-dock-monitor';
/* eslint-enable */
// You can toggle visibility of devTools with ctrl + H
// and change their position with ctrl + Q
export default createDevTools(
  <DockMonitor toggleVisibilityKey="ctrl-h" changePositionKey="ctrl-q" defaultIsVisible={false}>
    <LogMonitor />
  </DockMonitor>
);
