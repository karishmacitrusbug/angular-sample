import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RouteSegment } from '@global/enums/route-segment.enum';
import { LocalVatRegistrationVM } from '@global/interfaces/local-vat-registration.vm';
import { QuoteDetailsQuote } from '@modules/quote-list/interfaces/quote.interface';
import { CurrencyCode, OrderType, ServiceType } from '@CitT/data';

@Component({
  selector: 'app-your-quote-content',
  templateUrl: './your-quote-content.component.html',
  styleUrls: ['./your-quote-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class YourQuoteContentComponent {
  @Input() public quote: QuoteDetailsQuote;
  @Input() public localVatRegistration: LocalVatRegistrationVM | undefined;
  @Output() public accept = new EventEmitter<string>();
  @Output() public download = new EventEmitter<string>();
  @Output() public sendEmail = new EventEmitter<string>();
  @Output() public changeShipmentMethod = new EventEmitter<void>();
  @Output() public addPackage = new EventEmitter<QuoteDetailsQuote>();
  @Output() public toggleLiabilityCoverFee = new EventEmitter<{ isEnabled: boolean; quoteId: string }>();

  public readonly OrderType = OrderType;
  public currency = CurrencyCode.USD;

  public isQuoteAcceptanceDisabled(_quote: QuoteDetailsQuote): boolean {
    // TODO: Use local VAT registration here.
    return false;
  }

  public showCostRanges(quote: QuoteDetailsQuote): boolean {
    return quote.lineItemNumber === 0 && quote.serviceType !== ServiceType.EOR && quote.costs.estimatedTaxDutyCost !== 0;
  }

  public getQuoteRouterLink(quoteId: string): (RouteSegment | string)[] {
    return [RouteSegment.Root, RouteSegment.QuoteList, quoteId];
  }

  public onAddPackages(quote: QuoteDetailsQuote): void {
    this.addPackage.emit(quote);
  }

  public onAcceptClick(event: MouseEvent, quoteItem: QuoteDetailsQuote): void {
    event.stopPropagation();

    if (quoteItem.lineItemNumber) {
      this.accept.emit(quoteItem.id);
    }
  }

  public onMessageClick(event: MouseEvent, quoteId: string): void {
    event.stopPropagation();
    this.sendEmail.emit(quoteId);
  }

  public onDownloadClick(event: MouseEvent, quoteId: string): void {
    event.stopPropagation();
    this.download.emit(quoteId);
  }

  public onChangeShipmentMethod(): void {
    this.changeShipmentMethod.emit();
  }

  public trackByFn(_: number, quote: QuoteDetailsQuote): string {
    return quote.id;
  }

  public onLiabilityCoverFeeToggle(isEnabled: boolean, quoteId: string): void {
    this.toggleLiabilityCoverFee.emit({ isEnabled, quoteId });
  }
}
