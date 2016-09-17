import { Directive, OnInit, ElementRef } from '@angular/core';

@Directive({
    selector: '[active-menu]',
    inputs: ['language:active-menu']
})
export class ActiveMenuDirective implements OnInit {
    language: string;
    $element: any;

    constructor(el: ElementRef) {
        this.$element = $(el.nativeElement);
    }

    ngOnInit() {
        //TODO implement once translation is migrated
        /*scope.$watch(function() {
            return $translate.use();
        }, setActive(selectedLanguage));*/
        function setActive(selectedLanguage) {
            if (this.language === selectedLanguage) {
                //tmhDynamicLocale.set(this.language);
                this.$element.addClass('active');
            } else {
                this.$element.removeClass('active');
            }
        }
    }
}
