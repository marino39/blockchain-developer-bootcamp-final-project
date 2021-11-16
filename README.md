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
4. As a user I want to register my advertisement in the system.
5. As a user I want to bid for advertisement surface.
6. As a user I want to have my advertisement displayed on the advertisement surface of my choice.

## Workflows

### Operator - Advertisement Surface Tokenization

1. Users open dApp page
2. User go to My Surfaces page
3. They go to Add Surface page
4. They prepare advertisement surface specification: *name, description,
 size, resolution, location, default_content_url, minimal_bid*
5. They submit and receive tokenized advertisement surface (NFT)
6. They open surface page on the surface device. The page will stream
advertisements with the highest bid in given time frame.

### Operator - Fee collection

1. User open dApp page
2. They go to My Surfaces page
3. They select advertisement surface
4. They submit collect transaction and receives Dai

### Advertiser - Bid for Advertisement Surface

1. Users open dApp page
2. They go to Advertise page
3. They select advertisement surfaces that they want to use
4. They select day/week/month
5. They select times
6. They select their bid (need to be bigger than minimal bid for surface)
7. They submit & deposit Dai (bid x time in seconds)