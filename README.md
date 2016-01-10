# Amazon List Scraper
[![Build Status](https://travis-ci.org/luugiathuy/amazon-list-scraper.svg?branch=master)](https://travis-ci.org/luugiathuy/amazon-list-scraper) [![Coverage Status](https://coveralls.io/repos/luugiathuy/amazon-list-scraper/badge.svg?branch=master&service=github)](https://coveralls.io/github/luugiathuy/amazon-list-scraper?branch=master)

Scrape items from a public Amazon's list

## Install

```
$ npm install --save amazon-list-scraper
```

## Usage

```js
const AmazonListScraper = require('amazon-list-scraper');

const scraper = new AmazonListScraper();
scraper.scrape('https://www.amazon.com/gp/registry/wishlist/1JMCNHNT959X2')
  .then(items => {
    console.log(items);
    //  [
    //    { 
    //      title: 'The Principles of Object-Oriented JavaScript',
    //      price: 9.99,
    //      link: 'https://www.amazon.com/dp/B00I87B1H8/ref=wl_it_dp_v_nS_ttl/184-4221310-4664445?_encoding=UTF8&colid=1JMCNHNT959X2&coliid=I2ETH645CXBEGM'
    //    },
    //    { 
    //      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    //      price: 38.6,
    //      link: 'https://www.amazon.com/dp/0132350882/ref=wl_it_dp_v_nS_ttl/184-4221310-4664445?_encoding=UTF8&colid=1JMCNHNT959X2&coliid=IDGP10KBLGRPV'
    //    } 
    //  ]
  })
  .catch(error => {
  });
```

## API

## License

MIT © [Luu Gia Thuy](http://luugiathuy.com)
