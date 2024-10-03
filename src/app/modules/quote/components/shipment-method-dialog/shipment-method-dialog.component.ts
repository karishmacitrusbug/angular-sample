import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Freight } from '@global/interfaces/freight.interface';
import { DIALOG_DATA } from '@global/modules/dialog/dialog.tokens';
import { DialogData } from '@global/modules/dialog/interfaces/dialog-data.interface';
import { ShipmentMethod } from '@modules/quote/interfaces/shipment-method.interface';
import { ThirdPartyCourier } from '@modules/quote/interfaces/third-party-courier.interface';
import { CbCourier } from '@modules/quote/interfaces/cb-courier.interface';
import { FreightStatus, FreightType } from '@CitT/data';
import isNil from 'lodash/isNil';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, first, map, takeUntil } from 'rxjs/operators';
import { ShipmentMethodDialogPayload } from './shipment-method-dialog-payload.interface';
import { ShipmentMethodDialogResult } from './shipment-method-dialog-result.interface';

@Component({
  selector: 'app-shipment-method-dialog',
  templateUrl: './shipment-method-dialog.component.html',
  styleUrls: ['./shipment-method-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShipmentMethodDialogComponent implements OnInit, OnDestroy {
  private readonly shipmentMethods$ = new BehaviorSubject<ShipmentMethod[]>(this.data.payload.shipmentMethods);
  public get shipmentMethods(): ShipmentMethod[] {
    return this.shipmentMethods$.getValue();
  }
  public set shipmentMethods(shipmentMethods: ShipmentMethod[]) {
    this.shipmentMethods$.next(shipmentMethods);
  }
  private readonly selectedShipmentMethodType$ = new BehaviorSubject<FreightType>(this.data.payload.selectedShipmentMethodType);
  public get selectedShipmentMethodType(): FreightType {
    return this.selectedShipmentMethodType$.getValue();
  }
  public set selectedShipmentMethodType(selectedShipmentMethodType: FreightType) {
    this.selectedShipmentMethodType$.next(selectedShipmentMethodType);
  }
  private readonly selectedCbCourierId$ = new BehaviorSubject<string>(undefined);
  public get selectedCbCourierId(): string {
    return this.selectedCbCourierId$.getValue();
  }
  public set selectedCbCourierId(selectedCbCourierId: string) {
    this.selectedCbCourierId$.next(selectedCbCourierId);
  }
  public freight$: Observable<Freight> = this.data.payload.freight$;
  public zeeCouriers$: Observable<CbCourier[]> = this.data.payload.zeeCouriers$;
  public thirdPartyCouriers: ThirdPartyCourier[] = this.data.payload.thirdPartyCouriers;

  public canProceed$ = combineLatest([this.freight$, this.shipmentMethods$, this.selectedShipmentMethodType$]).pipe(
    map(([freight, shipmentMethods, selectedShipmentMethodType]) => {
      const selectedShipmentMethod = shipmentMethods.find((shipmentMethod) => shipmentMethod.type === selectedShipmentMethodType);

      if (isNil(selectedShipmentMethod)) {
        return false;
      }

      if (!selectedShipmentMethod.isHandledByCb) {
        return true;
      }

      return !isNil(freight.status) && freight.status !== FreightStatus.SEARCHING;
    }),
    distinctUntilChanged()
  );

  private readonly destroyed$ = new Subject<void>();

  constructor(
    @Inject(DIALOG_DATA) private readonly data: DialogData<ShipmentMethodDialogPayload, ShipmentMethodDialogResult>,
    private readonly cdr: ChangeDetectorRef
  ) {}

  public ngOnInit(): void {
    this.data.payload.freight$.pipe(takeUntil(this.destroyed$)).subscribe((freight) => {
      if (freight.status === FreightStatus.SEARCHING) {
        return;
      }
      this.updateShipmentMethodsWithFreightFee(freight.fee);
      this.cdr.markForCheck();
    });

    this.data.payload.selectedCbCourierId$
      .pipe(
        first((courierId) => !isNil(courierId)),
        takeUntil(this.destroyed$)
      )
      .subscribe(this.selectedCbCourierId$);
  }

  public ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private updateShipmentMethodsWithFreightFee(freightFee: number): void {
    this.shipmentMethods = this.shipmentMethods.map((shipmentMethod) =>
      shipmentMethod.isHandledByCb ? { ...shipmentMethod, freightAmount: freightFee } : shipmentMethod
    );
  }

  public onSelectShipmentMethod(shipmentMethod: ShipmentMethod): void {
    this.selectedShipmentMethodType = shipmentMethod.type;
  }

  public onSelectCbCourierId(zeeCourierId: string): void {
    this.selectedCbCourierId = zeeCourierId;
    this.zeeCouriers$.pipe(first(), takeUntil(this.destroyed$)).subscribe((zeeCouriers) => {
      const zeeCourier = zeeCouriers.find((courier) => courier.id === zeeCourierId);
      if (isNil(zeeCourier)) {
        return;
      }
      this.updateShipmentMethodsWithFreightFee(zeeCourier.fee);
      this.cdr.markForCheck();
    });
  }

  public onDiscardClick(): void {
    this.data.dialogRef.close();
  }

  public onSaveClick(): void {
    this.data.dialogRef.close({
      selectedShipmentMethodType: this.selectedShipmentMethodType,
      selectedCbCourierId: this.selectedCbCourierId,
    });
  }
}
