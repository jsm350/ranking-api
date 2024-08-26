const db = require('../config/db');
const scrapeArticle = require('../utils/scrapArticle');
exports.getArticleById = (req, res) => {
    const articleId = req.params.id;
    db.all('SELECT * FROM producer_article WHERE producer_id = ?', [articleId], (err, rows) => {
        if (err) {
            return res.status(500).json({message: 'Database error', error: err});
        }
        res.json(rows);
    });
};


exports.getArticleBySlug = (req, res) => {
    const slug = req.params.slug;

    db.all('SELECT * FROM producer_article WHERE producer_slug = ?', [slug], (err, rows) => {
        if (err) {
            return res.status(500).json({message: 'Database error', error: err});
        }
        res.json(rows);
    });
};


exports.addArticleByProducer = async (req, res) => {
    const producerId = req.params.id;
    const articles = req.body;

    try {
        const existingArticles = await new Promise((resolve, reject) => {
            db.all('SELECT id FROM producer_article WHERE producer_id = ?', [producerId], (err, rows) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows.map(row => row.id));
            });
        });
        const incomingArticleIds = new Set(articles.map(article => article.id).filter(id => id));
        const idsToDelete = existingArticles.filter(id => !incomingArticleIds.has(id));
        if (idsToDelete.length > 0) {
            await new Promise((resolve, reject) => {
                db.run('DELETE FROM producer_article WHERE producer_id = ? AND id IN (' + idsToDelete.map(() => '?').join(',') + ')', [producerId, ...idsToDelete], (err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            });
        }

        const insertArticlePromises = articles.map(async (article) => {
            const {id, producer_slug, link} = article;

            try {
                return new Promise(async(resolve, reject) => {
                    if (id) {
                        resolve();
                    } else {
                        let scrapedData = await scrapeArticle(link);
                        db.run(
                            'INSERT INTO producer_article (producer_id, producer_slug, link, title, excerpt, image_url) VALUES (?, ?, ?, ?, ?, ?)',
                            [
                                producerId,
                                producer_slug,
                                link,
                                scrapedData.title,
                                scrapedData.excerpt,
                                scrapedData.imageUrl
                            ],
                            function (err) {
                                if (err) {
                                    return reject(err);
                                }
                                resolve();
                            }
                        );
                    }

                });
            } catch (error) {
                throw new Error(`Error processing article data for link ${link}`);
            }
        });

        await Promise.all(insertArticlePromises);
        res.status(201).json({message: 'Articles processed successfully'});
    } catch (error) {
        res.status(500).json({message: 'Error processing articles', error: error.message});
    }
};