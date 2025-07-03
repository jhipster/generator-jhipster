import { Component, Injector, OnInit, Signal, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

import SharedModule from 'app/shared/shared.module';
import { ProfileService } from './profile.service';

@Component({
  selector: 'jhi-page-ribbon',
  template: `
    @if (ribbonEnvSignal; as ribbonEnv) {
      <div class="ribbon">
        <a href="" [jhiTranslate]="'global.ribbon.' + (ribbonEnv() ?? '')">{{ { dev: 'Development' }[ribbonEnv() ?? ''] }}</a>
      </div>
    }
  `,
  styleUrl: './page-ribbon.component.scss',
  imports: [SharedModule],
})
export default class PageRibbonComponent implements OnInit {
  ribbonEnvSignal?: Signal<string | undefined>;
  private readonly injector = inject(Injector);
  private readonly profileService = inject(ProfileService);

  ngOnInit(): void {
    const ribbonEnv$: Observable<string | undefined> = this.profileService.getProfileInfo().pipe(map(profileInfo => profileInfo.ribbonEnv));
    this.ribbonEnvSignal = toSignal(ribbonEnv$, { injector: this.injector });
  }
}
