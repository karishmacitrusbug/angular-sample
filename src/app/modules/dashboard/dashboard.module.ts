import { NgModule } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonDashboardModule } from '@global/modules/common-dashboard/common-dashboard.module';
import { LoadingIndicatorModule } from '@global/modules/loading-indicator/loading-indicator.module';
import { MessageDialogModule } from '@global/modules/message-dialog/message-dialog.module';
import { SelectionModule } from '@global/modules/selection/selection.module';
import { TasksModule } from '@global/modules/tasks/tasks.module';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '@shared/shared.module';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardEffects } from './effects/dashboard.effects';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page.component';
import * as fromDashboard from './reducers';

@NgModule({
  declarations: [DashboardPageComponent],
  imports: [
    SharedModule,
    DashboardRoutingModule,
    MatTabsModule,
    SelectionModule,
    LoadingIndicatorModule,
    StoreModule.forFeature(fromDashboard.dashboardFeatureKey, fromDashboard.reducers),
    EffectsModule.forFeature([DashboardEffects]),
    CommonDashboardModule.forFeature({ onboardingVisible: true }),
    MessageDialogModule,
    TasksModule,
  ],
})
export class DashboardModule {}
