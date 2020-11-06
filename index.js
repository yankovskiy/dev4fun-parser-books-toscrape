const { JSDOM } = require('jsdom');
const queue = require('async/queue');
const fs = require('fs');

const data = [];

/**
 * @param {string} url - ссылка для парсинга
 * @param {boolean} isDetailed - истина, если парсим страницу с карточкой товара
 * @return {Promise<void>}
 */
async function parse(url, isDetailed) {
    try {
        const dom = await JSDOM.fromURL(url);
        const d = dom.window.document;

        if (!isDetailed) {
            console.log(`Обработка страницы ${url}`);
            const books = d.querySelectorAll('article.product_pod');
            books.forEach(book => {
                const link = book.querySelector('h3 > a');
                if (link) {
                    const detailedUrl = 'https://books.toscrape.com/catalogue/' + link.getAttribute('href');
                    q.push({url: detailedUrl, isDetailed: true});
                }
            });

            const next = d.querySelector('li.next > a');
            if (next) {
                const nextUrl = 'https://books.toscrape.com/catalogue/' + next.getAttribute('href');
                q.push({url: nextUrl, isDetailed: false});
            }
        } else {
            console.log(`Обработка карточки товара ${url}`);
            const bookName = d.querySelector('h1').textContent;
            const bookPrice = d.querySelector('p.price_color').textContent;

            let bookDescription = '';
            const desc = d.querySelector("#content_inner > article > p");
            if (desc) {
                bookDescription = desc.textContent;
            }

            data.push({name: bookName, price: bookPrice, description: bookDescription});
        }
    } catch (e) {
        console.error(e);
    }
}

const q = queue(async (data, done) => {
    await parse(data.url, data.isDetailed);
    done();
} );

q.push({url: 'https://books.toscrape.com/catalogue/page-1.html', isDetailed: false});

(async () => {
    await q.drain();
    if (data.length > 0) {
        fs.writeFileSync('./result.txt', JSON.stringify(data));
        console.log(`Сохранено ${data.length} записей`);
    }
})();