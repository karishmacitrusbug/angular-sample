import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { CostExplanationDialogComponent } from './cost-explanation-dialog.component';
import { CostExplanationDialogService } from './cost-explanation-dialog.service';

@NgModule({
  imports: [SharedModule],
  declarations: [CostExplanationDialogComponent],
  exports: [CostExplanationDialogComponent],
  providers: [CostExplanationDialogService],
})
export class CostExplanationDialogModule {}
