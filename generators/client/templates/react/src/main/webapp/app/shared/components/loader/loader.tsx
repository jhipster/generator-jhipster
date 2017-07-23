import * as React from 'react';
import { CSSTransitionGroup } from 'react-transition-group';

import './loader.scss';

/* Note: This needs to be changed in the loader.scss import as well */
const DEFAULT_LOADER = 'ball-triangle-path';

// The types supported by https://github.com/ConnorAtherton/loaders.css
const Types = {
  'ball-pulse': 3,
  'ball-grid-pulse': 9,
  'ball-clip-rotate': 1,
  'ball-clip-rotate-pulse': 2,
  'square-spin': 1,
  'ball-clip-rotate-multiple': 2,
  'ball-pulse-rise': 5,
  'ball-rotate': 1,
  'cube-transition': 2,
  'ball-zig-zag': 2,
  'ball-zig-zag-deflect': 2,
  'ball-triangle-path': 3,
  'ball-scale': 1,
  'line-scale': 5,
  'line-scale-party': 4,
  'ball-scale-multiple': 3,
  'ball-pulse-sync': 3,
  'ball-beat': 3,
  'line-scale-pulse-out': 5,
  'line-scale-pulse-out-rapid': 5,
  'ball-scale-ripple': 1,
  'ball-scale-ripple-multiple': 3,
  'ball-spin-fade-loader': 8,
  'line-spin-fade-loader': 8,
  'triangle-skew-spin': 1,
  'pacman': 5,
  'ball-grid-beat': 9,
  'semi-circle-spin': 1
};

const range = x => {
  const arr = [];
  for (let i = 0; i < x; i++) { // eslint-disable-line fp/no-mutation
    arr.push(i); // eslint-disable-line fp/no-mutating-methods
  }
  return arr;
};

const renderDiv = n => {
  const styles = {};
  return <div key={n} style={styles} />;
};

const loader = (type, noText) => {
  const nDivs = range(Types[type]);

  return (
    <div className="loader-container">
      <div className="loading-icon">
        <div className={`loader loader-${type} loader-active`}>
          <div className={`loader-inner ${type}`}>
            {nDivs.map(renderDiv)}
          </div>
        </div>
        {noText ? '' :
        <div className="loading-text">
          Loading...
        </div>
        }
      </div>
    </div>
  );
};

const renderLoader = (loading, type, noText, children) => loading ? loader(type, noText) : <div>{children}</div>;

const Loader = ({ loading, type = DEFAULT_LOADER, noText = false, children }) => ( // eslint-disable-line react/prop-types
  <CSSTransitionGroup
    className="loader-container-stage"
    transitionName="crossfade"
    transitionAppear
    transitionAppearTimeout={300}
    transitionEnterTimeout={300}
    transitionLeaveTimeout={150}
    component="div"
    aria-busy={loading}
  >
    {renderLoader(loading, type, noText, children)}
  </CSSTransitionGroup>
);

export default Loader;
