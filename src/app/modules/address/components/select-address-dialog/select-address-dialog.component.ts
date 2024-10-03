import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy } from '@angular/core';
import { SelectAddressDialogType } from '@global/enums/select-address-dialog-type.enum';
import { AddressCardAddressVM as AddressVM } from '@global/interfaces/address/address.vm';
import { SelectAddressDialogPayload } from '@global/interfaces/address/select-address-dialog-payload.interface';
import { DIALOG_DATA } from '@global/modules/dialog/dialog.tokens';
import { DialogData } from '@global/modules/dialog/interfaces/dialog-data.interface';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-select-address-dialog',
  templateUrl: './select-address-dialog.component.html',
  styleUrls: ['./select-address-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectAddressDialogComponent implements OnDestroy {
  public payload: SelectAddressDialogPayload;
  public selectedAddresses: AddressVM[] = [];
  public SelectAddressDialogType = SelectAddressDialogType;

  private readonly destroyed$ = new Subject<void>();

  constructor(
    @Inject(DIALOG_DATA)
    private readonly data: DialogData<SelectAddressDialogPayload, AddressVM[]>,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.payload = this.data.payload;
  }

  public ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  public get isNewAddress(): boolean {
    return this.selectedAddresses.length === 0;
  }

  public onSelectedAddressChange(addresses: AddressVM[]): void {
    this.selectedAddresses = addresses;
    this.cdr.markForCheck();
  }

  public onAddAddressesClick(): void {
    this.data.dialogRef.close(this.selectedAddresses);
  }
}
