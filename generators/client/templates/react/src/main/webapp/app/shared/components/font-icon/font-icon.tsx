import * as React from 'react';

const FontIcon = ({ icon, className = '' }) => (
  <span className={`font-icon ${className}`}><i className="material-icons">{icon}</i></span>
);

export default FontIcon;
