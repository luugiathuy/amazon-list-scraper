import test from 'ava';
import AmazonListScraper from '../dist';

const testListURL = 'https://www.amazon.com/gp/registry/wishlist/1JMCNHNT959X2';
const multiPagesListURL = 'https://www.amazon.com/gp/registry/wishlist/1EL6CUGB5P0ZV';

test('expose a constructor', t => {
  t.is(typeof AmazonListScraper, 'function');
});

test('error if no url is specified', t => {
  return new AmazonListScraper().scrape().catch(err => {
    t.ok(err);
    t.is(err.message, 'URL required');
  });
});

test('error if url is not found', t => {
  const scraper = new AmazonListScraper();
  return scraper.scrape('https://www.amazon.com/notfound').catch(err => {
    t.ok(err);
  });
});

test('return list of items with title, price and link', t => {
  return new AmazonListScraper().scrape(testListURL).then(items => {
    t.is(items.length, 2);
    const { title, price, link } = items[0];
    t.is(title, `JavaScript: The Good Parts: The Good Parts`);
    t.true(!isNaN(parseFloat(price)));
    t.true(link.startsWith('https://www.amazon.com/dp/B0026OR2ZY'));
    t.is(items[1].title, `Clean Code: A Handbook of Agile Software Craftsmanship`);
  });
});

test('scrape next page of the list', t => {
  return new AmazonListScraper().scrape(multiPagesListURL).then(items => {
    t.is(items.length, 28);
  });
});

test('return empty list if not an Amazon list', t => {
  return new AmazonListScraper().scrape('https://google.com').then(items => {
    t.is(items.length, 0);
  });
});

test('return only Kindle books if kindleOnly option is true', t => {
  const scraper = new AmazonListScraper({ kindleOnly: true });
  return scraper.scrape(testListURL).then(items => {
    t.is(items.length, 1);
    const { title } = items[0];
    t.is(title, `JavaScript: The Good Parts: The Good Parts`);
  });
});
