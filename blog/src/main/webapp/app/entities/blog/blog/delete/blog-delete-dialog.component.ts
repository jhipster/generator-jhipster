import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IBlog } from '../blog.model';
import { BlogService } from '../service/blog.service';

@Component({
  templateUrl: './blog-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class BlogDeleteDialogComponent {
  blog?: IBlog;

  protected blogService = inject(BlogService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.blogService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
