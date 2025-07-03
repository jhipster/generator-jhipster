import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { IPost } from '../post.model';

@Component({
  selector: 'jhi-post-detail',
  templateUrl: './post-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class PostDetailComponent {
  post = input<IPost | null>(null);

  previousState(): void {
    window.history.back();
  }
}
