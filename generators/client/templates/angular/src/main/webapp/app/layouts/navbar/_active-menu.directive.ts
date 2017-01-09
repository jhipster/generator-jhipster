import { Directive, OnInit, ElementRef, Renderer, Input} from '@angular/core';
<%_ if (enableTranslation) { _%>
import { TranslateService, LangChangeEvent } from 'ng2-translate';
<%_ } _%>

@Directive({
    selector: '[<%=jhiPrefix%>ActiveMenu]'
})
export class ActiveMenuDirective implements OnInit {
    @Input() <%=jhiPrefix%>ActiveMenu: string;

    constructor(private el: ElementRef, private renderer: Renderer<% if (enableTranslation) { %>, private translateService: TranslateService<% } %>) {}

    ngOnInit() {
<%_ if (enableTranslation) { _%>
      this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
         this.updateActiveFlag(event.lang);
      });
      this.updateActiveFlag(this.translateService.currentLang);<% } %>
    }

    updateActiveFlag(selectedLanguage) {
      if (this.<%=jhiPrefix%>ActiveMenu === selectedLanguage) {
          this.renderer.setElementClass(this.el.nativeElement, 'active', true);
      } else {
          this.renderer.setElementClass(this.el.nativeElement, 'active', false);
      }
    }
}
