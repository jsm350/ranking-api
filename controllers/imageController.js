const OpenAI = require("openai");
const openai = new OpenAI();
const fs = require('fs');

exports.index = (req, res) => {
    let images = []
    try {
        const files = fs.readdirSync('uploads');
        // Filter to only include image files
        images = files.filter(file => /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(file));
        images = images.map(image => ({name: image, url: getFileURL(req, image)}))
    } catch (error) {
        images = []
        console.error("Error reading uploads directory:", error);
        // return [];
    }
    res.send({
        success: true,
        data: images
    })
}


const multer = require('multer');
// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Specify the directory to save the image
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Create a unique filename
    },
});

const upload = multer({storage: storage})

const getFileURL = (req, filename) => {
    return `${req.protocol}://${req.get('host')}/uploads/${filename}`
}
// Middleware to handle image upload
exports.upload = upload.single('image');

exports.store = async (req, res) => {
    if (!req.file) {
        console.log("No file received");
        return res.send({
            success: false
        });

    } else {
        const fileUrl = getFileURL(req, req.file.filename);

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-2024-08-06",
            messages: [
                {
                    role: "system",
                    content: "You are an expert in Olive Oil industry and have knowledge of all olive oil brands and producers available in market worldwide." +
                        "You have to determine the producer and brand of oil by looking into image of bottle provided in following json format {producer: 'Name of producer', brand: 'Name of brand'}." +
                        "If you don't recognize the bottle, you give a message in following format {error: 'The brand and producer can not be recognized. Please try with another picture.'} "
                },
                {
                    role: "user",
                    content: [
                        {type: "text", text: "What's the name of producer and brand of olive oil bottle in the image?"},
                        {
                            type: "image_url",
                            image_url: {
                                "url": fileUrl,
                            },
                        }
                    ],
                },
            ],
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "get_olive_oil_bottle_provider_and_brand",
                    schema: {
                        type: "object",
                        properties: {
                            producer: {
                                description: "The name of producer of olive oil bottle you determined from the image",
                                type: "string"
                            },
                            brand: {
                                description: "The name of brand of olive oil bottle you determined from the image",
                                type: "string"
                            }
                        },
                        additionalProperties: false
                    }
                }
            }
        });

        let result = null;
        try {
            result = JSON.parse(completion.choices[0].message.content);
        } catch (e) {
            result = {
                error: 'Failed to parse the response as JSON.'
            }
        }

        return res.send({
            success: (typeof result === 'object') && !result?.error,
            file: fileUrl,
            data: result
        })
    }
};

exports.destroy = (req, res) => {
    fs.unlink(`uploads/${req.params.imageName}`, (err) => {
        if (err) {
            console.error('Failed to delete image:', err);
            res.send({
                success: false,
                error: 'Failed to delete image'
            })
        }
    });
    res.send({
        success: true,
    })
}
