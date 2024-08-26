const puppeteer = require('puppeteer');

async function scrapeArticle(articleLink) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(articleLink, { waitUntil: 'networkidle2' });

    const data = await page.evaluate(() => {
        const title = document.querySelector('h1')?.innerText;
        const excerpt = document.querySelector('.brief-excerpt')?.innerText || document.querySelector('.bigger-p')?.innerText;
        const imageUrl = document.querySelector('figure img')?.src;

        return {
            title,
            excerpt,
            imageUrl,
        };
    });

    await browser.close();
    return data;
}

module.exports = scrapeArticle;
