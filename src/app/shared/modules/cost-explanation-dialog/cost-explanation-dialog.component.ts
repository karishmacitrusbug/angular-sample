import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { Costs } from '@global/interfaces/costs.interface';
import { DIALOG_DATA } from '@global/modules/dialog/dialog.tokens';
import { DialogData } from '@global/modules/dialog/interfaces/dialog-data.interface';

interface CostExplanation {
  /** Translation key of cost name */
  costName: string;
  /** Translation key of cost description */
  costDescription: string;
}

@Component({
  selector: 'app-cost-explanation-dialog',
  templateUrl: './cost-explanation-dialog.component.html',
  styleUrls: ['./cost-explanation-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CostExplanationDialogComponent {
  public costExplanations: CostExplanation[] = this.getCostExplanations();

  constructor(@Inject(DIALOG_DATA) private readonly data: DialogData<Costs>) {}

  private getCostExplanations(): CostExplanation[] {
    const costExplanations: CostExplanation[] = [];

    if (this.data.payload.iorFees > 0) {
      costExplanations.push({
        costName: 'COST_EXPLANATION_DIALOG.COSTS.IOR_AND_COMPLIANCE_FEE',
        costDescription: 'COST_EXPLANATION_DIALOG.COSTS.IOR_AND_COMPLIANCE_FEE_DESCRIPTION',
      });
    }

    if (this.data.payload.internationalDeliveryFee > 0) {
      costExplanations.push({
        costName: 'COST_EXPLANATION_DIALOG.COSTS.INTERNATIONAL_FREIGHT_FEE',
        costDescription: 'COST_EXPLANATION_DIALOG.COSTS.INTERNATIONAL_FREIGHT_FEE_DESCRIPTION',
      });
    }

    if (this.data.payload.dutiesAndOtherTaxesFee > 0) {
      costExplanations.push({
        costName: 'COST_EXPLANATION_DIALOG.COSTS.ESTIMATED_TAX_AND_DUTY',
        costDescription: 'COST_EXPLANATION_DIALOG.COSTS.ESTIMATED_TAX_AND_DUTY_DESCRIPTION',
      });
    }

    if (this.data.payload.bankFees > 0) {
      costExplanations.push({
        costName: 'COST_EXPLANATION_DIALOG.COSTS.BANK_FEES',
        costDescription: 'COST_EXPLANATION_DIALOG.COSTS.BANK_FEES_DESCRIPTION',
      });
    }

    if (this.data.payload.adminFee > 0) {
      costExplanations.push({
        costName: 'COST_EXPLANATION_DIALOG.COSTS.ADMIN_FEE',
        costDescription: 'COST_EXPLANATION_DIALOG.COSTS.ADMIN_FEE_DESCRIPTION',
      });
    }

    if (this.data.payload.customsBrokerageCosts > 0) {
      costExplanations.push({
        costName: 'COST_EXPLANATION_DIALOG.COSTS.CUSTOMS_BROKERAGE_FEE',
        costDescription: 'COST_EXPLANATION_DIALOG.COSTS.CUSTOMS_BROKERAGE_FEE_DESCRIPTION',
      });
    }

    if (this.data.payload.liabilityCoverFee > 0) {
      costExplanations.push({
        costName: 'COST_EXPLANATION_DIALOG.COSTS.LIABILITY_COVER_FEE',
        costDescription: 'COST_EXPLANATION_DIALOG.COSTS.LIABILITY_COVER_FEE_DESCRIPTION',
      });
    }

    return costExplanations;
  }

  public onCloseButtonClick(): void {
    this.data.dialogRef.close();
  }
}
