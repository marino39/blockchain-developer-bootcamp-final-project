# Decentralised Advertising Market

## Preface

The global advertisement market is 649.22bn $ and annual 11% growth rate. This 
market currently is dominated by big corporate agencies that do not want to talk
with smaller players. The whole process of getting advertisement is long,
heavily bureaucratised and fragmented.

The idea is to create decentralised market for digital advertisement. The market in question 
have two participants:

The Operators are responsible for providing physical infrastructure for advertisement
like boards, stands, TV or other advertisement surfaces. The infrastructure provided
is tokenized as a NFT and can be freely traded on the market. 

The Advertisers are people that want to have their advertisement displayed. They are able
to search for surfaces that meet their requirements and bid for time and surface that they
want to use to display it e.g.
2021-12-24 16:00:00 UTC - 2021-12-24 16:15:00 UTC
@
[New York Times Square Board](https://www.couturefashionweek.com/wp-content/uploads/2016/07/nasdaq-billboard-8in.jpg)

This project follows KISS principle. There are many issues that need to be addressed
in order to make such a market possible in real world e.g. check advertisements for adult content, make
sure that operator actually runs the contracted advertisement and many more. This issues can be addressed,
however solving them would make this project overly complicated. Therefore, I will implement the simplest
possible form of such a market.

## User Stories

1. As a user I want to register my digital board, stand, TV, tablet or display to be used for advertisement.
2. As a user I want to receive payment for my digital surface usage for advertisement.

3. As a user I want to find place where I can show my advertisement.
4. As a user I want to bid for advertisement surface.
5. As a user I want to have my advertisement displayed on the advertisement surface of my choice.

## Workflows

### Operator - Advertisement Surface Tokenization

1. Users open dApp page
2. User go to My Surfaces page
3. They go to Register Surface page
4. They prepare advertisement surface metadata and pin it to ipfs and provide CID(content id).
5. They provide ERC20 contract address for payments.
6. They provide minimal bid for 1 sec of advertisement display,
7. They submit and receive tokenized advertisement surface (NFT)
8. They open surface page on the surface device. The page will stream advertisements with the highest bid in given time
   frame.

### Operator - Fee collection

1. User open dApp page
2. They go to My Surfaces page
3. They select advertisement surface
4. They submit collect transaction and receives Dai

### Advertiser - Bid for Advertisement Surface

1. Users open dApp page
2. They go to Advertise page
3. They select advertisement surfaces that they want to use
4. They provide ERC721 contract address for tokenized advertisement
5. They provide token id of the tokenized advertisement
6. They provide their bid
7. Approve contract to be able to move funds (done only once)
8. They provide start time of the advertisement
9. They provide duration of the advertisement
10. They submit & deposit Dai (bid x time in seconds)

## Deployed version url

[https://dadvrtmarket.vercel.app/](https://dadvrtmarket.vercel.app/) *(Supported networks: Ropsten, Localhost)*

## Build & Run

### Prerequisites

- Node.js == v14
- Truffle and Ganache
- Yarn

### Contracts

- Run ```yarn install```
- Run ```echo "your secret" >> .secret```
- Run local testnet ```truffle development``` // port: 9545
- Migrate contracts ```truffle migrate --network develop```

### Front-end

- Go to ***frontend*** directory
- Make sure that you have installed follwing deps in your OS(required by web3-react):
  - build-tools
  - libusb-devel
  - libusbx-devel
  - libudev-devel
- Run ```yarn install```
- Run ```echo "SKIP_PREFLIGHT_CHECK=true" >> .env```
- Run ```yarn start```
- Open ***localhost:3000***

### Populating with mock data

- Mint MockDai coins for 3 first accounts  ```truffle exec scripts/mint_mock_dai.js --network develop```
- Register mock advertisement surfaces for first
  account ```truffle exec scripts/register_mock_surfaces.js --network develop```
- Mint advertisement NFTs for first account ```truffle exec scripts/mint_mock_nfts.js --network develop```

### Running tests

- Run ```truffle test```

### Directory structure

- ```contracts```: The solidity contracts
- ```examples```: The NFS metadata examples for advertisement surfaces as well as ads. I'm pinning them on IPFS so they
  can be used in the app.
- ```frontend```: The REACT client
- ```frontend/src/contracts```: The contracts abi
- ```migrations```: The truffle migrations
- ```scripts```: The scripts to populate contracts with data
- ```test```: The truffle tests directory

### Configuration

#### .env

- ```INFURA_URL``` - for mainnet
- ```INFURA_ROPSTEN_URL``` - for ropsten

#### .secret

The file should contain mnemonic used for deployments for mainnet and ropsten.

### ERC721 Metadata on IPFS(CIDs)

#### AdvertisementSurfaces:

- QmXasBSgmZrtRnxvEMZk8cSYPGogMnUexNVW8ynLEq9CK9
- QmaWeYNcqwPxM3aoAwS2GoicPoGSo79eny6EZL7Pe4Jkrx
- QmNcpqxvEwyEkLezxTsqee7espu7MN6Rbnc8MkYvFEya6U

To be used in Advertisement Surface registration.

#### Advertisements

- QmcYD2z5vWW9cymyarCPSgd2GJ5VnzbJkzMJpSAWH3mjtg
- QmXhx957X3gdSDmHkC3KhTQ6B3FRksr39MQyk4Suwn4tRC
- QmPqsXpRQj25uLNzRdimUWDFvnb7Q6UeT3P7bmAmHogM2i

They are used by a script to provide dummy advertisement NFTs.

***I will keep them pinned***

## Screencast link

[https://www.youtube.com/watch?v=ET_9lJBzidM](https://www.youtube.com/watch?v=ET_9lJBzidM)

## Public Ethereum wallet for certificate

```marcin.gorzynski.eth / 0x6Ee02cC6AcFc6af5912499EE265B92B195b49E44```