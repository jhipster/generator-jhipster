import { Directive, OnInit, ElementRef, Renderer} from '@angular/core';
<%_ if (enableTranslation) { _%>
import { TranslateService, LangChangeEvent } from 'ng2-translate/ng2-translate';
<%_ } _%>

@Directive({
    selector: '[active-menu]',
    inputs: ['language:active-menu']
})
export class ActiveMenuDirective implements OnInit {
    language: string;

    constructor(private el: ElementRef, private renderer: Renderer<% if (enableTranslation) { %>, private translateService: TranslateService<% } %>) {}

    ngOnInit() {
<%_ if (enableTranslation) { _%>
      this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
         this.updateActiveFlag(event.lang);
      });
      this.updateActiveFlag(this.translateService.currentLang);<% } %>
    }

    updateActiveFlag(selectedLanguage) {
      if (this.language === selectedLanguage) {
          this.renderer.setElementClass(this.el.nativeElement, 'active', true);
      } else {
          this.renderer.setElementClass(this.el.nativeElement, 'active', false);
      }
    }
}
