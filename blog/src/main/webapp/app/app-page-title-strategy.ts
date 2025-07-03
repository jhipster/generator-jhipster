import { Injectable, inject } from '@angular/core';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class AppPageTitleStrategy extends TitleStrategy {
  private readonly translateService = inject(TranslateService);

  override updateTitle(routerState: RouterStateSnapshot): void {
    let pageTitle = this.buildTitle(routerState);
    pageTitle ??= 'global.title';
    this.translateService.get(pageTitle).subscribe(title => {
      document.title = title;
    });
  }
}
