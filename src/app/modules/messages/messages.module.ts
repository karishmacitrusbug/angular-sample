import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonMessagesModule } from '@global/modules/common-messages/common-messages.module';
import { LoadingIndicatorModule } from '@global/modules/loading-indicator/loading-indicator.module';
import { MessageThreadModule } from '@global/modules/message-thread/message-thread.module';
import { PageContainerModule } from '@global/modules/page-container/page-container.module';
import { SelectModule } from '@global/modules/select/select.module';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '@shared/shared.module';
import { MessagesEffects } from './effects/messages.effects';
import { MessagesRoutingModule } from './messages-routing.module';
import { MessagesPageComponent } from './pages/messages-page/messages-page.component';
import * as fromMessages from './reducers';

@NgModule({
  declarations: [MessagesPageComponent],
  imports: [
    SharedModule,
    MessagesRoutingModule,
    PageContainerModule,
    MatTabsModule,
    MessageThreadModule,
    StoreModule.forFeature(fromMessages.messagesFeatureKey, fromMessages.reducers),
    EffectsModule.forFeature([MessagesEffects]),
    CommonMessagesModule.forFeature(),
    SelectModule,
    LoadingIndicatorModule,
    ReactiveFormsModule,
  ],
})
export class MessagesModule {}
