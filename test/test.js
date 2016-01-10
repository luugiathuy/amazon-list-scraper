import test from 'ava';
import AmazonListScraper from '../dist';

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
  return new AmazonListScraper().scrape('https://www.amazon.com/gp/registry/wishlist/1JMCNHNT959X2').then(items => {
    t.is(items.length, 2);
    const { title, price, link } = items[0];
    t.is(title, 'The Principles of Object-Oriente​d JavaScript');
    t.true(!isNaN(parseFloat(price)));
    t.true(!!link);
    t.is(items[1].title, 'Clean Code: A Handbook of Agile Software Craftsmanship');
  });
});

test('scrape next page of the list', t => {
  return new AmazonListScraper().scrape('https://www.amazon.com/gp/registry/wishlist/1EL6CUGB5P0ZV').then(items => {
    t.is(items.length, 28);
  });
});

test('return empty list if not an Amazon list', t => {
  return new AmazonListScraper().scrape('https://google.com').then(items => {
    t.is(items.length, 0);
  });
});
