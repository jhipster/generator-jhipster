import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IProduct } from '../product.model';
import { ProductService } from '../service/product.service';

@Component({
  templateUrl: './product-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class ProductDeleteDialogComponent {
  product?: IProduct;

  protected productService = inject(ProductService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.productService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
