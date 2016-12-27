import {Component, ElementRef, Input, Renderer} from '@angular/core';

@Component({
    selector: '<%=jhiPrefix%>-password-strength-bar',
    template: `
        <div id="strength">
            <small<% if (enableTranslation) { %> jhi-translate="global.messages.validate.newpassword.strength"<% } %>>Password strength:</small>
            <ul id="strengthBar">
                <li class="point"></li>
                <li class="point"></li>
                <li class="point"></li>
                <li class="point"></li>
                <li class="point"></li>
            </ul>
        </div>`
})
export class PasswordStrengthBarComponent {
    
    colors = ['#F00', '#F90', '#FF0', '#9F0', '#0F0'];

    measureStrength(p: string): number {

        let _force = 0;
        let _regex = /[$-/:-?{-~!"^_`\[\]]/g; // "

        let _lowerLetters = /[a-z]+/.test(p);
        let _upperLetters = /[A-Z]+/.test(p);
        let _numbers = /[0-9]+/.test(p);
        let _symbols = _regex.test(p);

        let _flags = [_lowerLetters, _upperLetters, _numbers, _symbols];
        let _passedMatches = _flags.filter( (isMatchedFlag: boolean) => {
            return isMatchedFlag === true;
        }).length;

        _force += 2 * p.length + ((p.length >= 10) ? 1 : 0);
        _force += _passedMatches * 10;

        // penality (short password)
        _force = (p.length <= 6) ? Math.min(_force, 10) : _force;

        // penality (poor variety of characters)
        _force = (_passedMatches === 1) ? Math.min(_force, 10) : _force;
        _force = (_passedMatches === 2) ? Math.min(_force, 20) : _force;
        _force = (_passedMatches === 3) ? Math.min(_force, 40) : _force;

        return _force;
    };

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
        return {idx: idx + 1, col: this.colors[idx]};
    };

    constructor(private renderer: Renderer, private elementRef: ElementRef) { }

    @Input()
    set passwordToCheck(password: string) {
        if (password) {
            let c = this.getColor(this.measureStrength(password));
            let element = this.elementRef.nativeElement;
            if ( element.className ) {
                this.renderer.setElementClass(element, element.className , false);
            }
            let lis = element.getElementsByTagName('li');
            for (let i = 0; i < lis.length; i++) {
                if (i < c.idx) {
                    this.renderer.setElementStyle(lis[i], 'backgroundColor', c.col);
                } else {
                    this.renderer.setElementStyle(lis[i], 'backgroundColor', '#DDD');
                }
            }
        }
    }
}
