import './password-strength-bar.<%= styleSheetExt %>';

import * as React from 'react';
import { Translate } from 'react-jhipster';

export interface IPasswordStrengthBarProps {
  password: string;
}

export default class PasswordStrengthBar extends React.Component<IPasswordStrengthBarProps> {
  colors = ['#F00', '#F90', '#FF0', '#9F0', '#0F0'];

  measureStrength(p: string): number {
    let force = 0;
    const regex = /[$-/:-?{-~!"^_`\[\]]/g; // "
    const lowerLetters = /[a-z]+/.test(p);
    const upperLetters = /[A-Z]+/.test(p);
    const numbers = /[0-9]+/.test(p);
    const symbols = regex.test(p);

    const flags = [lowerLetters, upperLetters, numbers, symbols];
    const passedMatches = flags.filter((isMatchedFlag: boolean) => isMatchedFlag === true).length;

    force += 2 * p.length + ((p.length >= 10) ? 1 : 0);
    force += passedMatches * 10;

    // penality (short password)
    force = (p.length <= 6) ? Math.min(force, 10) : force;

    // penality (poor variety of characters)
    force = (passedMatches === 1) ? Math.min(force, 10) : force;
    force = (passedMatches === 2) ? Math.min(force, 20) : force;
    force = (passedMatches === 3) ? Math.min(force, 40) : force;

    return force;
  }

  getColor(s: number): any {
    let idx = 0;
    if (s <= 10) {
      idx = 0;
    } else if (s <= 20) {
      idx = 1;
    } else if (s <= 30) {
      idx = 2;
    } else if (s <= 40) {
      idx = 3;
    } else {
      idx = 4;
    }
    return { idx: idx + 1, col: this.colors[idx] };
  }

  render() {
    const { password } = this.props;
    const strength = this.getColor(this.measureStrength(password));
    const points = [];

    for (let i = 0; i < 5; i++) {
      const style = {
        backgroundColor: (i < strength.idx) ? strength.col : '#DDD'
      };
      points.push(
        <li key={i} className="point" style={style}/>
      );
    }

    return (
      <div id="strength">
        <small>
          <Translate contentKey="global.messages.validate.newpassword.strength" />
        </small>
          <ul id="strengthBar">
            {points}
          </ul>
      </div>
    );
  }
}
