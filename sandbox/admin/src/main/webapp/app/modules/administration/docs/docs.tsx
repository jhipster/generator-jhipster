import './docs.scss';

import React from 'react';

const DocsPage = () => (
  <div>
    <iframe
      src="../swagger-ui/index.html"
      width="100%"
      height="800"
      title="Swagger UI"
      seamless
      style={{ border: 'none' }}
      data-cy="swagger-frame"
    />
  </div>
);

export default DocsPage;
