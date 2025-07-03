import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import SharedModule from 'app/shared/shared.module';

@Component({
  selector: 'jhi-error',
  templateUrl: './error.component.html',
  imports: [SharedModule],
})
export default class ErrorComponent implements OnInit, OnDestroy {
  errorMessage = signal<string | undefined>(undefined);
  errorKey?: string;
  langChangeSubscription?: Subscription;

  private readonly translateService = inject(TranslateService);
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.route.data.subscribe(routeData => {
      if (routeData.errorMessage) {
        this.errorKey = routeData.errorMessage;
        this.getErrorMessageTranslation();
        this.langChangeSubscription = this.translateService.onLangChange.subscribe(() => this.getErrorMessageTranslation());
      }
    });
  }

  ngOnDestroy(): void {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }

  private getErrorMessageTranslation(): void {
    this.errorMessage.set('');
    if (this.errorKey) {
      this.translateService.get(this.errorKey).subscribe(translatedErrorMessage => {
        this.errorMessage.set(translatedErrorMessage);
      });
    }
  }
}
