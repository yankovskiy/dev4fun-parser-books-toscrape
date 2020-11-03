const { JSDOM } = require('jsdom');
const queue = require('async/queue');
const fs = require('fs');

const data = [];

async function parse(url) {
    try {
        console.log(`Обработка страницы ${url}`);
        const dom = await JSDOM.fromURL(url);
        const d = dom.window.document;
        const books = d.querySelectorAll('article.product_pod');
        books.forEach( book => {
            let bookName = book.querySelector('h3 > a').getAttribute('title');
            let bookPrice = book.querySelector('p.price_color').textContent;
            data.push({name: bookName, price: bookPrice});
        });

        const next = d.querySelector('li.next > a');
        if (next) {
            const nextUrl = 'https://books.toscrape.com/catalogue/' + next.getAttribute('href');
            q.push(nextUrl);
        }
    } catch (e) {
        console.log(e);
    }
}

const q = queue(async (url, done) => {
    await parse(url);
    done();
} );

q.push('https://books.toscrape.com/catalogue/page-1.html');

(async () => {
    await q.drain();
    if (data.length > 0) {
        fs.writeFileSync('./result.txt', JSON.stringify(data));
        console.log(`Сохранено ${data.length} записей`);
    }
})();