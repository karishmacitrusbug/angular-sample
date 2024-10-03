import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { createMessageOrigin } from '@global/helpers/create-message-origin.helper';
import { AddNewProductItemDialogComponent } from '@global/modules/common-profile/components/add-new-product-item-dialog/add-new-product-item-dialog.component';
import { ProductDataVM } from '@global/modules/common-profile/interfaces/product-data.vm';
import { ProductCatalogService } from '@global/modules/common-profile/services/product-catalog.service';
import { DialogService } from '@global/modules/dialog/dialog.service';
import { DialogShowMode } from '@global/modules/dialog/enums/dialog-show-mode.enum';
import { LoadingIndicatorService } from '@global/modules/loading-indicator/services/loading-indicator.service';
import { MessageButtonUserVM as UserVM } from '@global/modules/message-button/user.vm';
import { CaseMessageDialogService } from '@global/modules/message-dialog/services/case-message-dialog.service';
import { StateIndicatorCircleState } from '@global/modules/state-indicator-circle/state.enum';
import { ToastMessageService } from '@global/modules/toast-message/toast-message.service';
import { ErrorNotificationService } from '@global/services/error-notification.service';
import { TeamMemberService } from '@global/services/team-member.service';
import { TranslateService } from '@ngx-translate/core';
import { EMPTY, of, Subject } from 'rxjs';
import { finalize, switchMap, takeUntil, tap } from 'rxjs/operators';

let PAGINATION_ID = 0;

@Component({
  selector: 'app-product-listing-page',
  templateUrl: './product-listing-page.component.html',
  styleUrls: ['./product-listing-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListingPageComponent implements OnInit, OnDestroy {
  public readonly StateIndicatorCircleState = StateIndicatorCircleState;

  public defaultTeamMember: UserVM;

  public productData: ProductDataVM[] = [];
  public isLoading = false;
  public currentPage = 1;
  public readonly paginationId = `productListingPagination-${PAGINATION_ID++}`;
  public readonly itemsPerPage = 15;
  private readonly destroyed$ = new Subject<void>();

  constructor(
    private readonly dialogService: DialogService,
    private readonly caseMessageDialogService: CaseMessageDialogService,
    private readonly productCatalogService: ProductCatalogService,
    private readonly loadingIndicatorService: LoadingIndicatorService,
    private readonly cdr: ChangeDetectorRef,
    private readonly toastMessageService: ToastMessageService,
    private readonly translateService: TranslateService,
    private readonly errorNotificationService: ErrorNotificationService,
    private readonly teamMemberService: TeamMemberService
  ) {}

  public ngOnInit(): void {
    this.loadProductCatalog();

    this.teamMemberService
      .getDefaultTeamMember$()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((teamMember) => {
        this.defaultTeamMember = teamMember;
        this.cdr.markForCheck();
      });
  }

  public ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private loadProductCatalog(): void {
    this.isLoading = true;
    this.productCatalogService
      .getProductCatalog$()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe(
        (productData) => {
          this.productData = productData;
          this.cdr.markForCheck();
        },
        (error) => this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_LOAD_PRODUCT_LISTING')
      );
  }

  public onAddNewItemClick(): void {
    this.dialogService
      .open<undefined, File>(AddNewProductItemDialogComponent, undefined, { showMode: DialogShowMode.Side })
      .afterClosed$()
      .pipe(
        switchMap((file?: File) =>
          file === undefined
            ? EMPTY
            : of({}).pipe(
                tap(() => this.loadingIndicatorService.open()),
                switchMap(() => this.productCatalogService.addNewProducts$(file)),
                finalize(() => this.loadingIndicatorService.dispose())
              )
        ),
        switchMap(() => this.translateService.get('PROFILE.PRODUCT_LISTING.ADD_PRODUCTS_SUCCESS')),
        takeUntil(this.destroyed$)
      )
      .subscribe(
        (successMessage) => this.toastMessageService.open(successMessage),
        (error) => this.errorNotificationService.notifyAboutError(error, 'ERROR.FAILED_TO_SUBMIT_NEW_PRODUCTS')
      );
  }

  public onPageChange(page: number): void {
    this.currentPage = page;

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }

  public onMessageClick(): void {
    this.caseMessageDialogService.open({
      messageTo: this.defaultTeamMember,
      origin: createMessageOrigin('Product Listing page'),
    });
  }
}
