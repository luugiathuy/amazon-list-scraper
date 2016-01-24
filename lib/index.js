import cheerio from 'cheerio';
import got from 'got';

const INVALID_PRICE = -1;
const KINDLE_EDITION_TEXT = '(Kindle Edition)';

export default class AmazonListScraper {
  constructor(options) {
    this.options = Object.assign({}, options);
  }

  scrape(listUrl) {
    if (!listUrl) {
      return Promise.reject(new Error('URL required'));
    }

    return new Promise((resolve, reject) => {
      got(listUrl).then(response => {
        const $ = cheerio.load(response.body, {
          normalizeWhitespace: true,
          xmlMode: true,
        });

        // Find all itemInfo divs and map them to item object which has title, price and link
        const items = $('#item-page-wrapper').find('div').filter(
          (i, ele) => this._isElementAnItemInfoDiv($, ele)
        ).map(
          (i, ele) => this._itemInfoElementToItem($, ele)
        ).get().filter(item => item);

        // Scrape next page if available
        const nextPageUrl = this._nextPageUrl($);
        if (nextPageUrl) {
          this.scrape(nextPageUrl).then(result => {
            Array.prototype.push.apply(items, result);
            resolve(items);
          }).catch(() => {
            resolve(items);
          });
        } else {
          resolve(items);
        }
      }).catch(error => {
        reject(error);
      });
    });
  }

  _isElementAnItemInfoDiv($, ele) {
    return ($(ele).attr('id') && $(ele).attr('id').slice(0, 'itemInfo'.length) === 'itemInfo');
  }

  _itemInfoElementToItem($, ele) {
    const titleNode = $(ele).find('a').filter((ii, elee) => {
      return $(elee).attr('title');
    });

    const title = titleNode.attr('title').trim();

    if (this.options.kindleOnly) {
      const subtitle = titleNode.closest('.a-row .a-size-small').text();
      if (!subtitle || subtitle.indexOf(KINDLE_EDITION_TEXT) === -1) {
        return null;
      }
    }

    const link = 'https://www.amazon.com' + titleNode.attr('href');

    let price = $(ele).find('.a-color-price').text().trim().split(' ')[0];
    if (price) {
      price = parseFloat(price.slice(1));
    }

    if (isNaN(price)) {
      price = INVALID_PRICE;
    }

    return { title, price, link };
  }

  _nextPageUrl($) {
    const nextElementLink = $('.a-last').find('a');
    if (nextElementLink.is('a')) {
      return 'https://www.amazon.com' + nextElementLink.attr('href');
    }
    return null;
  }
}
