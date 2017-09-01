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
      got(listUrl).then((response) => {
        const $ = cheerio.load(response.body, {
          normalizeWhitespace: true,
          xmlMode: true,
        });

        // Find all itemInfo divs and map them to item object which has title, price and link
        const items = $('#item-page-wrapper').find('div')
          .filter((i, ele) => AmazonListScraper.isElementAnItemInfoDiv($, ele))
          .map((i, ele) => AmazonListScraper.convertItemInfoElementToItem($, ele, this.options))
          .get()
          .filter(item => item);

        // Scrape next page if available
        const nextPageUrl = AmazonListScraper.getNextPageUrl($);
        if (nextPageUrl) {
          this.scrape(nextPageUrl).then((result) => {
            Array.prototype.push.apply(items, result);
            resolve(items);
          }).catch(() => {
            resolve(items);
          });
        } else {
          resolve(items);
        }
      }).catch((error) => {
        reject(error);
      });
    });
  }

  static isElementAnItemInfoDiv($, ele) {
    return ($(ele).attr('id') && $(ele).attr('id').slice(0, 'itemInfo'.length) === 'itemInfo');
  }

  static convertItemInfoElementToItem($, ele, options) {
    const titleNode = $(ele).find('a').filter((ii, elee) => $(elee).attr('title'));

    const title = titleNode.attr('title').trim();

    const productId = titleNode.attr('href').split('/')[2];

    if (options.kindleOnly) {
      const subtitle = titleNode.closest('.a-row .a-size-small').text();
      if (!subtitle || subtitle.indexOf(KINDLE_EDITION_TEXT) === -1) {
        return null;
      }
    }

    const link = `https://amzn.com${titleNode.attr('href')}`.split('/ref=')[0];

    let price = $(ele).find('.price-section').text()
      .trim()
      .split(' ')[0];
    if (price) {
      price = parseFloat(price.slice(1));
    }

    if (isNaN(price)) {
      price = INVALID_PRICE;
    }

    return { title, price, productId, link };
  }

  static getNextPageUrl($) {
    const nextElementLink = $('.a-last').find('a');
    if (nextElementLink.is('a')) {
      return `https://www.amazon.com${nextElementLink.attr('href')}`;
    }
    return null;
  }
}
