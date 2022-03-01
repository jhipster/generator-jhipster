import { Component, ElementRef, Input, Renderer2 } from '@angular/core';

@Component({
  selector: 'jhi-password-strength-bar',
  templateUrl: './password-strength-bar.component.html',
  styleUrls: ['./password-strength-bar.component.scss'],
})
export class PasswordStrengthBarComponent {
  colors = ['#F00', '#F90', '#FF0', '#9F0', '#0F0'];

  constructor(private renderer: Renderer2, private elementRef: ElementRef) {}

  measureStrength(p: string): number {
    let force = 0;
    const regex = /[$-/:-?{-~!"^_`[\]]/g; // "
    const lowerLetters = /[a-z]+/.test(p);
    const upperLetters = /[A-Z]+/.test(p);
    const numbers = /\d+/.test(p);
    const symbols = regex.test(p);

    const flags = [lowerLetters, upperLetters, numbers, symbols];
    const passedMatches = flags.filter((isMatchedFlag: boolean) => isMatchedFlag === true).length;

    force += 2 * p.length + (p.length >= 10 ? 1 : 0);
    force += passedMatches * 10;

    // penalty (short password)
    force = p.length <= 6 ? Math.min(force, 10) : force;

    // penalty (poor variety of characters)
    force = passedMatches === 1 ? Math.min(force, 10) : force;
    force = passedMatches === 2 ? Math.min(force, 20) : force;
    force = passedMatches === 3 ? Math.min(force, 40) : force;

    return force;
  }

  getColor(s: number): { idx: number; color: string } {
    let idx = 0;
    if (s > 10) {
      if (s <= 20) {
        idx = 1;
      } else if (s <= 30) {
        idx = 2;
      } else if (s <= 40) {
        idx = 3;
      } else {
        idx = 4;
      }
    }
    return { idx: idx + 1, color: this.colors[idx] };
  }

  @Input()
  set passwordToCheck(password: string) {
    if (password) {
      const c = this.getColor(this.measureStrength(password));
      const element = this.elementRef.nativeElement;
      if (element.className) {
        this.renderer.removeClass(element, element.className);
      }
      const lis = element.getElementsByTagName('li');
      for (let i = 0; i < lis.length; i++) {
        if (i < c.idx) {
          this.renderer.setStyle(lis[i], 'backgroundColor', c.color);
        } else {
          this.renderer.setStyle(lis[i], 'backgroundColor', '#DDD');
        }
      }
    }
  }
}
