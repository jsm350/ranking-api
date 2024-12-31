const db = require("../config/db");
exports.index = (req, res) => {
    db.all('SELECT * FROM distributors', (err, rows) => {
        if (err) {
            return res.status(500).send(
                {
                    success: false,
                    error: err,
                }
            );
        }
        res.send({
            success: true,
            data: rows,
        });
    });
}

exports.show = (req, res) => {
    db.all('SELECT * FROM distributors WHERE slug = ?', [req.params.distributorSlug], (err, rows) => {
        if (err) {
            return res.status(500).send(
                {
                    success: false,
                    error: err,
                }
            );
        }
        res.send({
            success: true,
            data: rows,
        });
    });
}

exports.store = async (req, res) => {
    const producers = req.body;
    if (!producers.length) {
        return res.send({
            success: false,
            error: 'No producers selected'
        });

    }
    producers.map(async (producer) => {
        try {
            return new Promise(async (resolve, reject) => {
                db.run(
                    'INSERT OR IGNORE INTO distributors (producer_id, label, slug) VALUES (?, ?, ?)',
                    [producer.id, producer.label, producer.producer_slug],
                    function (err) {
                        if (err) {
                            return reject(err);
                        }
                        resolve();
                    }
                );
            })
        } catch (error) {
            res.send({
                success: false,
                error: `Error saving distributor for producer ${producer.label}`
            })
            throw new Error(`Error saving distributor for producer ${producer.label}`);
        }
    });

    return res.send({
        success: true,
        data: producers,
        message: 'Distributors saved successfully'
    })
};

exports.destroy = async (req, res) => {
    await new Promise((resolve, reject) => {
        db.run('DELETE FROM distributors WHERE id = ?', [req.params.distributorId], (err) => {
            if (err) {
                res.send({
                    success: false,
                    error: `Error deleting distributor.`
                })
                return reject(err);
            }
            resolve();
        });
    });
    return res.send({
        success: true,
        message: 'Distributor deleted successfully'
    })
}
