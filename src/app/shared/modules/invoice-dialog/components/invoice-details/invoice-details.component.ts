import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { InvoiceType } from '@global/enums/invoice-type.enum';
import { RouteSegment } from '@global/enums/route-segment.enum';
import { WeightUnit } from '@global/enums/weight-unit.enum';
import { FileHelper } from '@global/helpers/file.helper';
import { InvoiceDetailsFeeVM } from '@global/modules/common-invoices/interfaces/fee.interface';
import {
  InvoiceDetails,
  InvoiceDetailsVM,
} from '@global/modules/common-invoices/interfaces/invoice-details.vm';
import { InvoiceDialogPayload } from '@global/modules/common-invoices/interfaces/invoice-dialog-payload.interface';
import { InvoiceDetailsService } from '@global/modules/common-invoices/service/invoice-details.service';
import { CaseMessageDialogService } from '@global/modules/message-dialog/services/case-message-dialog.service';
import { TeamMemberListType } from '@global/modules/message-thread/enums/team-member-list-type.enum';
import { ToastMessageService } from '@global/modules/toast-message/toast-message.service';
import { ErrorNotificationService } from '@global/services/error-notification.service';
import { TranslateService } from '@ngx-translate/core';
import { CaseSource, InvoiceStatus } from '@CitT/data';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

/**
 * Component responsible for displaying and managing invoice details.
 *
 * This component fetches and presents detailed information about an invoice,
 * including various fees associated with it. It also handles actions
 * such as sending invoice emails, downloading invoices, and interacting
 * with shipment orders. The component uses an OnPush change detection strategy
 * for performance optimization.
 */
@Component({
  selector: 'app-invoice-details',
  templateUrl: './invoice-details.component.html',
  styleUrls: ['./invoice-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceDetailsComponent implements OnInit, OnDestroy {
  // Input property to receive invoice data from a parent component.
  @Input() public invoice: InvoiceDialogPayload;

  // Output event emitter for notifying parent component when the shipment order name is clicked.
  @Output() public shipmentOrderNameClick = new EventEmitter<void>();

  // Holds the invoice details after fetching from the service.
  public invoiceDetails: InvoiceDetailsVM;

  // Loading state for invoice details.
  public isLoadingDetails = false;

  // Array of fees associated with the invoice.
  public fees: InvoiceDetailsFeeVM[] = [];

  // Router link for navigating to shipment details.
  public shipmentDetailsRouterLink: string[] = [
    RouteSegment.Root,
    RouteSegment.ShipmentsList,
  ];

  // Constants for invoice type and other properties.
  public readonly InvoiceType = InvoiceType;
  public readonly DATE_FORMAT = 'dd LLL yyyy';
  public readonly weightUnit = WeightUnit.Kg;
  public readonly RouteSegment = RouteSegment;

  // Subject to manage component destruction lifecycle.
  private readonly destroyed$ = new Subject<void>();

  constructor(
    private readonly caseMessageDialogService: CaseMessageDialogService, // Service for managing case messages.
    private readonly invoiceDetailsService: InvoiceDetailsService, // Service for fetching invoice details.
    private readonly cdr: ChangeDetectorRef, // Change detection reference.
    private readonly errorNotificationService: ErrorNotificationService, // Service for error notifications.
    private readonly toastMessageService: ToastMessageService, // Service for displaying toast messages.
    private readonly translateService: TranslateService // Service for translation.
  ) {}

  // Checks if the invoice has a credit note title based on its type.
  public get hasCreditNoteTitle(): boolean {
    return (
      this.invoice.type === InvoiceType.OpenCredits ||
      (this.invoice.type === InvoiceType.Closed && this.invoice.isCreditNote)
    );
  }

  // Lifecycle hook for initializing the component.
  public ngOnInit(): void {
    this.loadInvoiceDetails(); // Load invoice details on initialization.
  }

  // Lifecycle hook for cleanup on component destruction.
  public ngOnDestroy(): void {
    this.destroyed$.next(); // Notify that the component is being destroyed.
    this.destroyed$.complete(); // Complete the subject.
  }

  // Loads invoice details from the service.
  private loadInvoiceDetails(): void {
    this.isLoadingDetails = true; // Set loading state to true.
    this.invoiceDetailsService
      .getInvoiceDetails$(this.invoice.id, this.invoice.orderId)
      .pipe(
        finalize(() => {
          this.isLoadingDetails = false; // Set loading state to false after fetching.
          this.cdr.markForCheck(); // Trigger change detection.
        }),
        takeUntil(this.destroyed$) // Unsubscribe on component destruction.
      )
      .subscribe((invoiceDetails) => {
        this.invoiceDetails = invoiceDetails; // Store the fetched invoice details.
        this.shipmentDetailsRouterLink.push(
          this.invoiceDetails.shipmentOrder.id
        ); // Update shipment details router link.
        this.fees = this.getFees(this.invoiceDetails); // Get associated fees.
        this.cdr.markForCheck(); // Trigger change detection.
      });
  }

  // Extracts fees from invoice details and returns an array of fee objects.
  private getFees(invoiceDetails: InvoiceDetailsVM): InvoiceDetailsFeeVM[] {
    return [
      {
        label: 'COMMON.FEES.IOR_AND_IMPORT',
        value: invoiceDetails.details.iorFees,
      },
      {
        label: 'COMMON.FEES.EOR_AND_IMPORT',
        value: invoiceDetails.details.eorFees,
      },
      {
        label: 'COMMON.FEES.ADMIN_FEE',
        value: invoiceDetails.details.adminFee,
      },
      {
        label: 'COMMON.FEES.CUSTOMS_BROKERAGE_COSTS',
        value: invoiceDetails.details.customsBrokerageCosts,
      },
      {
        label: 'COMMON.FEES.CLEARANCE_COSTS',
        value: invoiceDetails.details.customsClearanceCosts,
      },
      {
        label: 'COMMON.FEES.HANDLING_COSTS',
        value: invoiceDetails.details.customsHandlingCosts,
      },
      {
        label: 'COMMON.FEES.LICENSE_FEES',
        value: invoiceDetails.details.customsLicenseFees,
      },
      {
        label: 'COMMON.FEES.BANK_FEES',
        value: invoiceDetails.details.bankFees,
      },
      {
        label: 'COMMON.FEES.CASH_OUTLAY_FEE',
        value: invoiceDetails.details.cashOutlayFee,
      },
      {
        label: 'COMMON.FEES.CIT_SHIPPING_SERVICE_FEE',
        value: invoiceDetails.details.citrShippingServiceFees,
      },
      {
        label: 'COMMON.FEES.LIABILITY_COVER_FEE',
        value: invoiceDetails.details.liabilityCoverFee,
      },
      {
        label: 'COMMON.FEES.RECHARGE_TAX_AND_DUTY_OTHER',
        value: invoiceDetails.details.rechargeTaxAndDutyOther,
      },
      {
        label: 'COMMON.FEES.COLLECTION_ADMINISTRATION_FEE',
        value: invoiceDetails.details.collectionAdministrationFee,
      },
      {
        label: 'COMMON.FEES.TAX_AND_DUTY',
        value: invoiceDetails.details.taxAndDuty,
      },
      {
        label: invoiceDetails.details.miscellaneousFeeName,
        value: invoiceDetails.details.miscellaneousFee,
      },
    ].filter((fee) => !!fee.value); // Filter out any fees that don't have a value.
  }

  // Sends an email with the invoice and displays a success or error message based on the result.
  public onMessageClick(): void {
    this.invoiceDetailsService
      .sendInvoiceEmail$(this.invoice.id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        () =>
          this.toastMessageService.open(
            this.translateService.instant(
              'INVOICES_PAGE.ACCOUNT_STATEMENT_EMAIL_SENT_SUCCESSFULLY'
            )
          ),
        (error) =>
          this.errorNotificationService.notifyAboutError(
            error,
            'ERROR.FAILED_TO_SEND_INVOICE_EMAIL'
          )
      );
  }

  // Opens the message manager dialog for the invoice.
  public onMessageManager(): void {
    const shipmentOrder = this.invoiceDetails.shipmentOrder;

    this.caseMessageDialogService.open({
      messageTo: this.invoiceDetails.defaultTeamMember,
      teamMemberListType: TeamMemberListType.Invoice,
      shipment: {
        id: shipmentOrder.id,
        reference: shipmentOrder.reference,
        title: shipmentOrder.name,
      },
      source: {
        type: CaseSource.NCP_INVOICE,
        recordId: this.invoice.id,
      },
      id: this.invoice.id,
      invoiceName: this.invoice.name,
    });
  }

  // Triggers the download of the invoice.
  public onDownloadClick(): void {
    this.invoiceDetailsService
      .downloadInvoice$(this.invoice.id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (attachment) => FileHelper.downloadDataFile(attachment),
        (error) =>
          this.errorNotificationService.notifyAboutError(
            error,
            'ERROR.FAILED_TO_DOWNLOAD_INVOICE'
          )
      );
  }

  // Checks if a given date is in the past.
  public isPastDate(date: Date): boolean {
    return date < new Date(); // Return true if the date is in the past.
  }

  // Gets the due date from the invoice or invoice details.
  public getDueDate(invoiceDetails: InvoiceDetails): string | Date {
    return this.invoice.dueDate || invoiceDetails?.dueDate; // Return the due date.
  }

  // Emits an event when the shipment order name is clicked.
  public onShipmentOrderNameClick(): void {
    this.shipmentOrderNameClick.emit(); // Emit event for shipment order name click.
  }

  // Checks if the invoice status is one of the paid statuses.
  public showStatus(invoiceStatus: InvoiceStatus): boolean {
    return (
      invoiceStatus === InvoiceStatus.PAID ||
      invoiceStatus === InvoiceStatus.PAID_VIA_STRIPE ||
      invoiceStatus === InvoiceStatus.POP_RECEIVED
    ); // Return true if the status indicates the invoice is paid.
  }
}
