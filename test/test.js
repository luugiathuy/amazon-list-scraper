import test from 'ava';
import AmazonListScraper from '../dist';

const testListURL = 'https://www.amazon.com/gp/registry/wishlist/1JMCNHNT959X2';
const multiPagesListURL = 'https://www.amazon.com/gp/registry/wishlist/1EL6CUGB5P0ZV';

test('expose a constructor', t => t.is(typeof AmazonListScraper, 'function'));

test('error if no url is specified', t => (
  new AmazonListScraper().scrape().catch((err) => {
    t.truthy(err);
    t.is(err.message, 'URL required');
  })
));

test('error if url is not found', t => (
  new AmazonListScraper().scrape('https://www.amazon.com/notfound').catch((err) => {
    t.truthy(err);
  })
));

test('return list of items with title, price and link', t => (
  new AmazonListScraper().scrape(testListURL).then((items) => {
    t.is(items.length, 2);
    const { title, price, productId, link } = items[0];
    // eslint-disable-next-line no-script-url
    t.is(title, 'JavaScript: The Good Parts: The Good Parts');
    t.true(!isNaN(parseFloat(price)));
    t.true(link.startsWith('https://amzn.com/dp/B0026OR2ZY'));
    t.is(productId, 'B0026OR2ZY');
    t.is(items[1].title, 'Clean Code: A Handbook of Agile Software Craftsmanship');
  })
));

test('returns links without ref path', t => (
  new AmazonListScraper().scrape(testListURL).then((items) => {
    const { link } = items[0];
    t.false(/ref=/.test(link));
  })
));

test('returns links without query params', t => (
  new AmazonListScraper().scrape(testListURL).then((items) => {
    const { link } = items[0];
    t.false(link.includes('?_encoding=UTF8&colid=1JMCNHNT959X2&coliid=I65VI60WE4DXL'));
  })
));

test('scrape next page of the list', t => (
  new AmazonListScraper().scrape(multiPagesListURL).then((items) => {
    t.is(items.length, 26);
  })
));

test('return empty list if not an Amazon list', t => (
  new AmazonListScraper().scrape('https://google.com').then((items) => {
    t.is(items.length, 0);
  })
));

test('returns list order by price asc when sort option is price-asc', t => (
  new AmazonListScraper({ sort: 'price-asc' }).scrape(multiPagesListURL).then((items) => {
    t.is(items[0].title, 'How to Fly a Horse: The Secret History of Creation, Invention, and Discovery');
  })
));

test('returns list order by price desc when sort option is price-desc', t => (
  new AmazonListScraper({ sort: 'price-desc' }).scrape(testListURL).then((items) => {
    t.is(items[0].title, 'Clean Code: A Handbook of Agile Software Craftsmanship');
  })
));

test('return only Kindle books if kindleOnly option is true', t => (
  new AmazonListScraper({ kindleOnly: true }).scrape(testListURL).then((items) => {
    t.is(items.length, 1);
    const { title } = items[0];
    // eslint-disable-next-line no-script-url
    t.is(title, 'JavaScript: The Good Parts: The Good Parts');
  })
));
