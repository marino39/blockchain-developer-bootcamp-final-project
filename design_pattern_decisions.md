## Design patterns used

### Inter-Contract Execution

The ```AdvertisementSurfaceAuction``` is interacting with ```AdverisementSurface``` NFT contract that is used to
tokenize advertisement surfaces in form of NFTs and holds information about their payment methods. It's also
executing ```ERC20``` contracts to make payment for advertisers Bids and to allow owners of advertisement surface to
collect payments.

### Inheritance and Interfaces

The ```AdverisementSurface``` inherits from OpenZeppelin contracts and interfaces such us ```ERC721URIStorage``` and
```ERC721Enumerable```. It also inherits from internal abstract contract responsible for keeping payment information
```AdvertisementSurfacePayments```. There is also ```IAdvertisementSurface``` and ```IAdvertisementSurfaceAuction```
can be used by client applications to interact with contracts.

The ```AdvertisementSurfaceAuction``` inherits from ```IAdvertisementSurfaceAuction```.

The ```AdvertisementSurfacePayments``` inherits from ```IAdvertisementSurfacePayments```.

There is also ```MockDAI``` and ```MockNFT``` contracts that use OpenZeppelin abstract contracts and interfaces. However
they are not part of final application. They are only helpers for testing purposes.

### Access Control Design Patterns

There is custom access control implemented in ```AdvertisementSurfaceAuction``` contract for getting bid refund and
collecting payment(```AdvertisementSurfaceAuction.refundBid``` and ```AdvertisementSurfaceAuction.collectBid```). The
```AdverisementSurface``` has built in token ownership which is part of ERC721 standard and provided by OpenZeppelin
implementation.