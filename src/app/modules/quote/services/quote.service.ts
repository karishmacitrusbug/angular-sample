import { Injectable } from '@angular/core';
import { LengthUnit } from '@global/enums/length-unit.enum';
import { WeightUnit } from '@global/enums/weight-unit.enum';
import { sequence } from '@global/helpers/rx.helper';
import { ChargeableWeightDialogPackageVM } from '@global/interfaces/package.vm';
import { User } from '@global/interfaces/user.interface';
import { UpdateQuoteService } from '@global/modules/common-quote/services/update-quote.service';
import { PackageService } from '@global/modules/packages/package.service';
import { QuoteDataService } from '@CitT/data';
import isEmpty from 'lodash/isEmpty';
import { Observable } from 'rxjs';
import { QuoteBasicsForm } from '../interfaces/quote-basics-form.interface';

interface EditQuotePayload {
  quoteId: string;
  freightId: string;
  lengthUnit: LengthUnit;
  weightUnit: WeightUnit;
  packages: ChargeableWeightDialogPackageVM[];
  clientContact?: string;
}

@Injectable()
export class QuoteService {
  constructor(
    private readonly quoteDataService: QuoteDataService,
    private readonly packageService: PackageService,
    private readonly updateQuoteService: UpdateQuoteService
  ) {}

  public editQuote$(quoteData: EditQuotePayload, values: QuoteBasicsForm, user: User): Observable<void> {
    const updateRequests: Observable<any>[] = [
      this.updateQuoteService.updateQuote$(quoteData.quoteId, {
        ...values,
        clientContactForShipment: quoteData.clientContact,
        to: [values.to],
      }),
    ];

    if (!isEmpty(values.pickUpAddress)) {
      updateRequests.push(
        this.quoteDataService.updateFreightAddress({
          Accesstoken: user.accessToken,
          FRID: quoteData.freightId,
          PickupaddressID: values.pickUpAddress[0].id,
        })
      );
    }

    if (!isEmpty(values.packages)) {
      updateRequests.push(
        this.packageService.updateQuotePackages$(
          {
            quoteId: quoteData.quoteId,
            packages: quoteData.packages,
            lengthUnit: quoteData.lengthUnit,
            weightUnit: quoteData.weightUnit,
          },
          { packages: values.packages },
          user
        )
      );
    }
    return sequence(updateRequests);
  }
}
