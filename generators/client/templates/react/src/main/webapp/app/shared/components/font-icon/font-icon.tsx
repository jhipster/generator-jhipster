import * as React from 'react';

const FontIcon = ({ icon, className = '' }) => ( // eslint-disable-line react/prop-types
  <span className={`font-icon ${className}`}><i className="material-icons">{icon}</i></span>
);

export default FontIcon;
