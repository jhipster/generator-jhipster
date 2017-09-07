<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see http://www.jhipster.tech/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
import { Component, ElementRef, Input, Renderer } from '@angular/core';

@Component({
    selector: '<%=jhiPrefix%>-password-strength-bar',
    template: `
        <div id="strength">
            <small<% if (enableTranslation) { %> jhiTranslate="global.messages.validate.newpassword.strength"<% } %>>Password strength:</small>
            <ul id="strengthBar">
                <li class="point"></li>
                <li class="point"></li>
                <li class="point"></li>
                <li class="point"></li>
                <li class="point"></li>
            </ul>
        </div>`,
    styleUrls: [
        <%_ if (useSass) { _%>
        'password-strength-bar.scss'
        <%_ } else { _%>
        'password-strength-bar.css'
        <%_ } _%>
    ]
})
export class PasswordStrengthBarComponent {

    colors = ['#F00', '#F90', '#FF0', '#9F0', '#0F0'];

    constructor(private renderer: Renderer, private elementRef: ElementRef) { }

    measureStrength(p: string): number {

        let force = 0;
        const regex = /[$-/:-?{-~!"^_`\[\]]/g; // "
        const lowerLetters = /[a-z]+/.test(p);
        const upperLetters = /[A-Z]+/.test(p);
        const numbers = /[0-9]+/.test(p);
        const symbols = regex.test(p);

        const flags = [lowerLetters, upperLetters, numbers, symbols];
        const passedMatches = flags.filter( (isMatchedFlag: boolean) => {
            return isMatchedFlag === true;
        }).length;

        force += 2 * p.length + ((p.length >= 10) ? 1 : 0);
        force += passedMatches * 10;

        // penality (short password)
        force = (p.length <= 6) ? Math.min(force, 10) : force;

        // penality (poor variety of characters)
        force = (passedMatches === 1) ? Math.min(force, 10) : force;
        force = (passedMatches === 2) ? Math.min(force, 20) : force;
        force = (passedMatches === 3) ? Math.min(force, 40) : force;

        return force;
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

    @Input()
    set passwordToCheck(password: string) {
        if (password) {
            const c = this.getColor(this.measureStrength(password));
            const element = this.elementRef.nativeElement;
            if ( element.className ) {
                this.renderer.setElementClass(element, element.className , false);
            }
            const lis = element.getElementsByTagName('li');
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
