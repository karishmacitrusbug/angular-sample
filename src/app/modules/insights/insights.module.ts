import { NgModule } from '@angular/core';
import { CommonInsightsModule } from '@global/modules/common-insights/common-insights.module';
import { PageContainerModule } from '@global/modules/page-container/page-container.module';
import { SharedModule } from '@shared/shared.module';
import { InsightsPageComponent } from './insights-page.component';
import { InsightsRoutingModule } from './insights-routing.module';

@NgModule({
  declarations: [InsightsPageComponent],
  imports: [SharedModule, PageContainerModule, InsightsRoutingModule, CommonInsightsModule],
})
export class InsightsModule {}
