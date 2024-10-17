import OpenAI from "openai";
const openai = new OpenAI();

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

const upload = multer({ storage: storage })

// Middleware to handle image upload
exports.upload = upload.single('image');

exports.saveImage = async (req, res) => {
    if (!req.file) {
        console.log("No file received");
        return res.send({
            success: false
        });

    } else {
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are an expert in Olive Oil industry and have knowledge of all olive oil brands and producers available in market worldwide." +
                        "You have to determine the producer and brand of oil by looking into image of bottle provided in following json format {producer: 'Name of producer', brand: 'Name of brand'}." +
                        "If you don't recognize the bottle, you give a message saying 'The brand and producer can not be recognized. Please try with another picture.'"
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "What's the name of producer and brand of olive oil bottle in the image?" },
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
                // See /docs/guides/structured-outputs
                type: "json_schema",
                json_schema: {
                    name: "olive oil bottle schema",
                    schema: {
                        type: "object",
                        properties: {
                            email: {
                                description: "The email address that appears in the input",
                                type: "string"
                            }
                        },
                        additionalProperties: false
                    }
                }
            }
        });

        console.log(completion.choices[0].message);

        return res.send({
            success: true,
            file: fileUrl
        })
    }
};
