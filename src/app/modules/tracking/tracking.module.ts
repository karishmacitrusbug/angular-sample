import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonTrackingModule } from '@global/modules/common-tracking/common-tracking.module';
import { ContextMenuModule } from '@global/modules/context-menu/context-menu.module';
import { LoadingIndicatorModule } from '@global/modules/loading-indicator/loading-indicator.module';
import { MessageButtonModule } from '@global/modules/message-button/message-button.module';
import { MessageDialogModule } from '@global/modules/message-dialog/message-dialog.module';
import { PageContainerModule } from '@global/modules/page-container/page-container.module';
import { SearchFieldModule } from '@global/modules/search-field/search-field.module';
import { TrackerModule } from '@global/modules/tracker/tracker.module';
import { TrackingLogCardModule } from '@global/modules/tracking-log-card/tracking-log-card.module';
import { TrackingNumberModule } from '@global/modules/tracking-number/tracking-number.module';
import { TrackingDetailsDialogComponent } from '@modules/tracking/components/tracking-details-dialog/tracking-details-dialog.component';
import { TrackingDetailsDialogService } from '@modules/tracking/components/tracking-details-dialog/tracking-details-dialog.service';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@shared/shared.module';
import { TrackingEffects } from './effects/tracking.effects';
import { TrackingPageComponent } from './pages/tracking-page.component';
import * as fromTracker from './reducers';
import { TrackingRoutingModule } from './tracking-routing.module';

@NgModule({
  declarations: [TrackingPageComponent, TrackingDetailsDialogComponent],
  imports: [
    CommonModule,
    CommonTrackingModule,
    TrackingRoutingModule,
    SharedModule,
    SearchFieldModule,
    TrackerModule,
    MessageButtonModule,
    TrackingLogCardModule,
    LoadingIndicatorModule,
    StoreModule.forFeature(fromTracker.trackingFeatureKey, fromTracker.reducers),
    EffectsModule.forFeature([TrackingEffects]),
    MessageDialogModule,
    TrackingNumberModule,
    ContextMenuModule,
    PageContainerModule,
    FormsModule,
    TranslateModule,
  ],
  providers: [TrackingDetailsDialogService],
})
export class TrackingModule {}
