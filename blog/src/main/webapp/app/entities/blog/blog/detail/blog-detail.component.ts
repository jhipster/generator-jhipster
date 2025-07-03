import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { IBlog } from '../blog.model';

@Component({
  selector: 'jhi-blog-detail',
  templateUrl: './blog-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class BlogDetailComponent {
  blog = input<IBlog | null>(null);

  previousState(): void {
    window.history.back();
  }
}
