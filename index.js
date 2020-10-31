const { JSDOM } = require('jsdom');
const data = [];

(async () => {
    try {
        const dom = await JSDOM.fromURL('https://books.toscrape.com/');
        const d = dom.window.document;
        const books = d.querySelectorAll('article.product_pod');
        books.forEach( book => {
            let bookName = book.querySelector('h3 > a').getAttribute('title');
            let bookPrice = book.querySelector('p.price_color').textContent;
            data.push({name: bookName, price: bookPrice});
        });
        if (data.length > 0) {
            console.log(JSON.stringify(data, null, ' '));
        }
    } catch (e) {
        console.log(e);
    }
})();