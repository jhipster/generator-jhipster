import * as React from 'react';
import { Button, Tooltip } from 'reactstrap';
import * as uuidV4 from 'uuid/v4';
import { omit } from 'lodash';

import FontIcon from '../font-icon/font-icon';

export interface IconButtonProps {
  icon: string;
  tooltip?: string;
  tooltipPlacement?: string;
  [key: string]: any;
}
export default class IconButton extends React.Component<IconButtonProps, { tooltipOpen: boolean }> {

  static defaultProps = {
    tooltip: null,
    tooltipPlacement: 'bottom'
  };

  constructor(props) {
    super(props);
    this.state = {
      tooltipOpen: false
    };
  }

  toggle = () => {
    this.setState({
      tooltipOpen: !this.state.tooltipOpen
    });
  }

  render() {
    const { icon, tooltip, tooltipPlacement } = this.props;
    const buttonId = `icon-button-${uuidV4()}`;
    const buttonProps = omit(this.props, [ 'tooltipPlacement', 'tooltip' ]);
    return (
      <span className="icon-button">
        <Button id={buttonId} {...buttonProps}>
          <FontIcon icon={icon} />
        </Button>
        {tooltip ?
          <Tooltip placement={tooltipPlacement} isOpen={this.state.tooltipOpen} target={buttonId} toggle={this.toggle}>
            {tooltip}
          </Tooltip> : null
        }
      </span>
    );
  }
}
