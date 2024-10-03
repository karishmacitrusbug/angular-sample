import { ThirdPartyCourier as ThirdPartyCourierResponse } from '@CitT/data';
import { ThirdPartyCourier } from '../interfaces/third-party-courier.interface';

export const mapThirdPartyCouriers = (couriers: ThirdPartyCourierResponse[]): ThirdPartyCourier[] =>
  couriers.map(
    (courier): ThirdPartyCourier => ({
      name: courier.ProviderAccountName,
      description: courier.Description,
      websiteUrl: courier.Link,
      shipmentMethodType: courier.Preferredshippingmethod,
    })
  );
