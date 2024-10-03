import { Injectable } from '@angular/core';
import { DialogRef } from '@global/modules/dialog/dialog-ref';
import { DialogService } from '@global/modules/dialog/dialog.service';
import { TermsAndPrivacyPolicyDialogComponent } from '../components/terms-and-privacy-policy-dialog/terms-and-privacy-policy-dialog.component';

/**
 * Service responsible for opening the Terms and Privacy Policy dialog.
 *
 * This service leverages the DialogService to manage the lifecycle of the
 * Terms and Privacy Policy dialog component. It provides a simple interface
 * to open the dialog, which can be used throughout the application to
 * display terms and privacy information to the user.
 */
@Injectable()
export class PrivacyAndTermsDialogService {
  constructor(private readonly dialogService: DialogService) {}

  /**
   * Opens the Terms and Privacy Policy dialog.
   *
   * @returns {DialogRef} A reference to the opened dialog instance, allowing
   *                     for further interaction with the dialog (e.g.,
   *                     closing the dialog or retrieving data).
   */
  public open(): DialogRef {
    return this.dialogService.open(TermsAndPrivacyPolicyDialogComponent);
  }
}
