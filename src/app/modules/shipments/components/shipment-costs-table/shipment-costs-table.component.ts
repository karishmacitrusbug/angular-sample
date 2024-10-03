import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ShipmentCostItem } from '@modules/shipments/interfaces/shipment-costs-item.vm';
import { ShipmentDetailsShipmentVM } from '@modules/shipments/interfaces/shipment-details-shipment.vm';
import { InvoicingTermParameter, OrderType } from '@CitT/data';
import isNil from 'lodash/isNil';

@Component({
  selector: 'app-shipment-costs-table',
  templateUrl: './shipment-costs-table.component.html',
  styleUrls: ['./shipment-costs-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShipmentCostsTableComponent implements OnChanges {
  @Input() public shipment: ShipmentDetailsShipmentVM;
  public shipmentCosts: ShipmentCostItem[];
  public OrderType = OrderType;

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes?.shipment) {
      this.updateCostsList();
    }
  }

  public get totalAmount(): number {
    const potentialCashOutlayFee = this.shipment.totalCosts.potentialCashOutlayFee ?? 0;
    return this.shipment.totalCosts.totalInvoiceAmount + potentialCashOutlayFee;
  }

  private updateCostsList() {
    const costs = this.shipment.totalCosts;

    this.shipmentCosts = [
      {
        name: 'COMMON.FEES.IOR_AND_IMPORT',
        value: costs.iorFees,
        highlight: false,
      },
      {
        name: 'COMMON.FEES.EOR_AND_IMPORT',
        value: costs.eorFees,
        highlight: false,
      },
      {
        name: 'COMMON.FEES.ADMIN_FEE',
        value: costs.adminFee,
        highlight: false,
      },
      {
        name: 'COMMON.FEES.BANK_FEES',
        value: costs.bankFees,
        highlight: false,
      },
      {
        name: 'COMMON.FEES.CLEARANCE_COSTS',
        value: costs.customsClearanceCosts,
        highlight: false,
      },
      {
        name: 'COMMON.FEES.CUSTOMS_BROKERAGE_COSTS',
        value: costs.customsBrokerageCosts,
        highlight: false,
      },
      {
        name: 'COMMON.FEES.HANDLING_COSTS',
        value: costs.customsHandlingCosts,
        highlight: false,
      },
      {
        name: 'COMMON.FEES.LICENSE_FEES',
        value: costs.customsLicenseFees,
        highlight: false,
      },
      {
        name: 'COMMON.FEES.CASH_OUTLAY_FEE',
        value: costs.cashOutlayFee,
        highlight: false,
      },
      {
        name: 'COMMON.FEES.LIABILITY_COVER_FEE',
        value: costs.liabilityCoverFee,
        highlight: false,
      },
      {
        name: 'COMMON.FEES.COLLECTION_ADMINISTRATION_FEE',
        value: costs.collectionAdministrationFee,
        highlight: false,
      },
      {
        name: 'COMMON.FEES.VAT_GST',
        value: costs.vatGstFee,
        highlight: false,
      },
      {
        name: 'COMMON.FEES.DUTIES_AND_OTHER_TAXES',
        value: costs.dutiesAndOtherTaxesFee,
        highlight: false,
      },
      {
        name: 'COMMON.FEES.CIT_SHIPPING_SERVICE_FEE',
        value: costs.zeeShippingServiceFees,
        highlight: false,
      },
      {
        name: costs.miscellaneousFeeName,
        value: costs.miscellaneousFee,
        highlight: false,
      },
      {
        name: `COMMON.FEES.CASH_DISBURSEMENT_FEE_${
          this.shipment.invoicingTerm === InvoicingTermParameter.FULL_TERMS ? 'FULL' : 'NO'
        }_TERMS`,
        value: costs.potentialCashOutlayFee,
        highlight: false,
      },
    ].filter((fee) => !isNil(fee.value) && fee.value !== 0);
  }
}
