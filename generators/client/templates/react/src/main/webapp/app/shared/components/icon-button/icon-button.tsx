import * as React from 'react';
import { Button, UncontrolledTooltip } from 'reactstrap';
import * as uuidV4 from 'uuid-v4';

import FontIcon from '../font-icon/font-icon';

export interface IconButtonProps {
  icon: string;
  tooltip?: string;
  tooltipPlacement?: string;
  [key: string]: any;
}
const IconButton = ({ icon, tooltip, tooltipPlacement = 'bottom', ...buttonProps }: IconButtonProps) => {

  const buttonId = `icon-button-${uuidV4()}`;

  return (
    <span className="icon-button">
      <Button id={buttonId} {...buttonProps}>
        <FontIcon icon={icon} />
      </Button>
      {tooltip ?
        <UncontrolledTooltip placement={tooltipPlacement} target={buttonId}>
          {tooltip}
        </UncontrolledTooltip> : null
      }
    </span>
  );
};

export default IconButton;
