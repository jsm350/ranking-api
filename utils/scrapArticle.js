const puppeteer = require('puppeteer');

async function scrapeArticle(articleLink) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(articleLink, { waitUntil: 'networkidle2' });

    const data = await page.evaluate(() => {
        // Try to get the title from h1; if not available, get it from h2 inside the parent div
        let title = document.querySelector('h1')?.innerText || document.querySelector('#cover-news-left h2')?.innerText;
        const excerpt = document.querySelector('.brief-excerpt')?.innerText || document.querySelector('#cover-news-left .bigger-p')?.innerText;

        let imageUrl = window.getComputedStyle(document.querySelector('#cover-news-content'))?.backgroundImage;

        if (imageUrl && imageUrl !== 'none') {
            imageUrl = imageUrl.slice(5, -2);
        } else {
            imageUrl = document.querySelector('figure img')?.src;
        }

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
