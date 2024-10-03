import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ProfileAndNotificationsPageVM } from '@global/modules/common-profile/interfaces/profile-and-notifications-page.vm';
import { ProfileAndNotificationsService } from '@global/modules/common-profile/services/profile-and-notifications.service';
import { ToastMessageService } from '@global/modules/toast-message/toast-message.service';
import { FormBuilder, FormControl } from '@ngneat/reactive-forms';
import { TranslateService } from '@ngx-translate/core';
import { EMPTY, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-profile-and-notifications',
  templateUrl: './profile-and-notifications-page.component.html',
  styleUrls: ['./profile-and-notifications-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileAndNotificationsPageComponent implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>();

  public isLoading = false;
  public user: ProfileAndNotificationsPageVM['user'];

  public notificationsForm = this.formBuilder.group<ProfileAndNotificationsPageVM['notifications']>({
    newTasks: this.formBuilder.control({ value: true, disabled: true }),
    taskCompletion: this.formBuilder.control({ value: true, disabled: true }),
    majorUpdates: this.formBuilder.control({ value: true, disabled: true }),
    minorUpdates: this.formBuilder.control(true),
  });

  public fileControl = this.formBuilder.control(undefined);

  public get majorChangesControl(): FormControl {
    return this.notificationsForm.controls.majorUpdates as FormControl;
  }

  public get minorChangesControl(): FormControl {
    return this.notificationsForm.controls.minorUpdates as FormControl;
  }

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly profileAndNotificationsService: ProfileAndNotificationsService,
    private readonly toastMessageService: ToastMessageService,
    private readonly translateService: TranslateService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  public ngOnInit(): void {
    this.loadInitialData();
    this.handleProfilePictureChange();
    this.handleNotifications();
  }

  public ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  public onRequestChange(): void {
    this.profileAndNotificationsService
      .requestChange$({ user: this.user, notifications: this.notificationsForm.getRawValue() })
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.toastMessageService.open(this.translateService.instant('PROFILE.NOTIFICATIONS.SUCCESSFULLY_UPDATED_PROFILE'));
        this.loadInitialData();
        this.cdr.markForCheck();
      });
  }

  private loadInitialData(): void {
    this.isLoading = true;

    this.profileAndNotificationsService
      .getVM$()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((vm) => {
        this.user = vm.user;
        this.notificationsForm.patchValue(vm.notifications, { emitEvent: false });
        this.isLoading = false;

        this.cdr.markForCheck();
      });
  }

  private handleProfilePictureChange(): void {
    this.fileControl.valueChanges
      .pipe(
        switchMap((file) => {
          if (!file) {
            return EMPTY;
          }

          return this.profileAndNotificationsService.uploadProfilePicture$(file);
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe();
  }

  private handleNotifications(): void {
    this.notificationsForm.valueChanges
      .pipe(
        switchMap(() =>
          this.profileAndNotificationsService.updateProfile$({
            user: this.user,
            notifications: this.notificationsForm.getRawValue(),
          })
        ),
        takeUntil(this.destroyed$)
      )
      .subscribe(() => {
        this.toastMessageService.open(this.translateService.instant('PROFILE.NOTIFICATIONS.SUCCESSFULLY_UPDATED_NOTIFICATIONS'));
      });
  }
}
