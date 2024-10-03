import { RouteSegment } from '@global/enums/route-segment.enum';
import { TrackingState } from '@global/enums/tracking-state.enum';
import { TrackingDetailsVM } from '@global/interfaces/tracking/tracking-details.vm';
import { TrackingItemVM } from '@global/interfaces/tracking/tracking-item.vm';
import { Observable } from 'rxjs';

export interface TrackingDetailsDialogPayload {
  selectedItem: TrackingItemVM;
  selectedItemDetails: TrackingDetailsVM;
  stateIcons: Record<TrackingState, string>;
  isDetailsLoading$: Observable<boolean>;
  shipmentDetailsRouterLink: (RouteSegment | string)[];
  trackerStatusTitle: string;
  isFullHistoryShown: boolean;
  onReuseDataClick: () => void;
  toggleTrackingHistory: () => void;
  TrackingState: typeof TrackingState;
}
