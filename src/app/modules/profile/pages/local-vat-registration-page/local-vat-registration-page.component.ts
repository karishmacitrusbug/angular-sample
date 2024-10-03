import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { LocalVatRegistrationVM } from '@global/interfaces/local-vat-registration.vm';
import * as fromLocalVatRegistrations from '@modules/profile/reducers';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import * as LocalVatRegistrationsActions from '../../actions/local-vat-registrations.actions';

@Component({
  selector: 'app-local-vat-registration-page',
  templateUrl: './local-vat-registration-page.component.html',
  styleUrls: ['./local-vat-registration-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocalVatRegistrationPageComponent implements OnInit, OnDestroy {
  public filterText = '';
  public localVats$: Observable<LocalVatRegistrationVM[]> = this.store$.select(fromLocalVatRegistrations.selectLocalVatRegistrations);
  public filteredLocalVats$: Observable<LocalVatRegistrationVM[]> = this.store$.select(
    fromLocalVatRegistrations.selectFilteredRegistrations
  );
  public isLoading$: Observable<boolean> = this.store$.select(fromLocalVatRegistrations.selectLocalVatRegistrationsLoading);

  private readonly destroyed$ = new Subject<void>();

  constructor(private readonly store$: Store<fromLocalVatRegistrations.AppState>) {}

  public ngOnInit(): void {
    this.store$.dispatch(LocalVatRegistrationsActions.enter());
  }

  public onSearch(keyword: string): void {
    this.filterText = keyword;
    this.store$.dispatch(LocalVatRegistrationsActions.updateKeyword({ keyword }));
  }
  public onAddNewRegistration(): void {
    this.store$.dispatch(LocalVatRegistrationsActions.create());
  }
  public onEditClick(vatRegistrationData: LocalVatRegistrationVM): void {
    this.store$.dispatch(LocalVatRegistrationsActions.edit({ vatRegistrationData }));
  }

  public ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
    this.store$.dispatch(LocalVatRegistrationsActions.leave());
  }
}
