import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-insights-page',
  templateUrl: './insights-page.component.html',
  styleUrls: ['./insights-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InsightsPageComponent {}
