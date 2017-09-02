import cheerio from 'cheerio';
import phantom from 'phantom';

const KINDLE_EDITION_TEXT = '(Kindle Edition)';

export default class AmazonListScraper {
  constructor(options) {
    this.options = Object.assign({
      sort: 'default',
    }, options);
  }

  async scrape(listUrl) {
    if (!listUrl) {
      throw new Error('URL required');
    }

    const instance = await phantom.create([], { logLevel: 'error' });
    const page = await instance.createPage();

    const status = await page.open(listUrl);

    if (status !== 'success') {
      await instance.exit();
      throw new Error(`Failed to load webpage at ${listUrl}`);
    }

    while (true) {
      const content = await page.property('content');
      const hasMoreContent = content.match(/wl-see-more/g) !== null;
      if (!hasMoreContent) {
        break;
      }

      // Scroll to bottom to load more
      page.evaluateJavaScript(`function() {
          // Scrolls to the bottom of page
          window.document.body.scrollTop = window.document.body.scrollHeight;
        }`);
    }

    const content = await page.property('content');
    await instance.exit();

    const $ = cheerio.load(content, {
      normalizeWhitespace: true,
      xmlMode: true,
    });

    // Find all itemInfo divs and map them to item object which has title, price and link
    let items = $('#item-page-wrapper').find('div')
      .filter((i, ele) => AmazonListScraper.isElementAnItemInfoDiv($, ele))
      .map((i, ele) => AmazonListScraper.convertItemInfoElementToItem($, ele, this.options))
      .get()
      .filter(item => item);

    switch (this.options.sort) {
      case 'price-asc':
        items = AmazonListScraper.sortPriceAsc(items);
        break;
      case 'price-desc':
        items = AmazonListScraper.sortPriceDesc(items);
        break;
      default:
        break;
    }

    return items;
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
    } else {
      price = NaN;
    }

    return { title, price, productId, link };
  }

  static sortPriceAsc(items) {
    return items.sort((a, b) => ((a.price < b.price || isNaN(b.price)) ? -1 : 1));
  }

  static sortPriceDesc(items) {
    return items.sort((a, b) => ((a.price < b.price || isNaN(b.price)) ? 1 : -1));
  }
}
