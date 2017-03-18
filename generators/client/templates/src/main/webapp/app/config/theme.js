import {
  teal500, teal700,
  pinkA200,
  grey100, grey300, grey400, grey500,
  white, darkBlack, fullBlack
} from 'material-ui/styles/colors';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

export default getMuiTheme({
  palette: {
    primary1Color: teal500,
    primary2Color: teal700,
    primary3Color: grey400,
    accent1Color: pinkA200,
    accent2Color: grey100,
    accent3Color: grey500,
    textColor: darkBlack,
    alternateTextColor: white,
    canvasColor: white,
    borderColor: grey300,
    // disabledColor: fade(darkBlack, 0.3),
    pickerHeaderColor: teal500,
    // clockCircleColor: fade(darkBlack, 0.07),
    shadowColor: fullBlack
  }
});
