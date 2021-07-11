const formidable = require('formidable');
const _ = require('lodash');
const Product = require('../models/product');
const fs = require('fs');
const path = require('path');

const { errorHandler } = require('../helpers/dbErrorHandler');

exports.create = function(req, res) {


    // Initializing the form
    let form = new formidable.IncomingForm();
    form.encoding = 'utf-8'; // code
    form.keepExtensions = true; // keep the extension
    form.multiples = true;
    form.uploadDir = __dirname + '../../public/'; //File storage path Finally, pay attention to adding '/'  Otherwise it will be stored under public


    form.parse(req, (err, fields, files) => { // parse formData data

        if (err) {

            if (files.images && files.images != '') {
                // loop to go through every image
                for (image of files.images) {

                    // Index of first character of the image name 
                    let imageNameIndex = image.path.lastIndexOf('\\') + 1;

                    // try to remove the image from temperoty location due to the error occurred
                    try {
                        //removing the file
                        fs.unlinkSync(image.path.substring(imageNameIndex));

                    } catch (err) {
                        console.error(err)
                    }
                }
            }

            return res.status(400).json({
                "errors": [{
                    "msg": "Image could not be uploaded",
                    "param": "images"
                }]
            });
        }




        const product = new Product();

        if (!fields.sku || fields.sku.length == 0) {
            return res.status(400).json({
                "errors": [{
                    "msg": "SKU is required",
                    "param": "sku"
                }]
            });
        } else {
            if (fields.sku.length < 2 || fields.sku.length > 15) {
                return res.status(400).json({
                    "errors": [{
                        "msg": "SKU must be between 2 to 15 characters",
                        "param": "sku"
                    }]
                });
            }

            let sku = fields.sku;
            Product.findOne({ sku }).exec(function(err, data) {
                if (!err) {
                    product.sku = fields.sku;
                } else {
                    res.status(400).json({
                        "errors": [{
                            "msg": "SKU already exists",
                            "value": fields.sku,
                            "param": "sku"
                        }]
                    });
                }


            });

        }





        if (!fields.name && fields.name.length == 0) {
            return res.status(400).json({
                "errors": [{
                    "msg": "Name is required",
                    "param": "name"
                }]
            });
        } else {
            if (fields.name.length < 2 || fields.name.length > 15) {
                return res.status(400).json({
                    "errors": [{
                        "msg": "Name must be between 2 to 15 characters",
                        "param": "name"
                    }]
                });
            }

            let name = fields.name;
            Product.findOne({ name }).exec(function(err, data) {
                if (!err) {
                    product.name = fields.name;
                } else {
                    res.status(400).json({
                        "errors": [{
                            "msg": "Name already exists",
                            "value": fields.name,
                            "param": "name"
                        }]
                    });
                }

            });

        }




        product.sku = fields.sku;
        product.name = fields.name;
        product.ribbon = fields.ribbon;
        product.categoryId = fields.categoryId;
        product.costPrice = fields.costPrice;
        product.margin = fields.margin;
        product.stickerPrice = fields.stickerPrice;
        product.onSale = fields.onSale;
        product.discount = fields.discount;
        product.description = fields.description;
        product.additionalInfo = fields.additionalInfo;
        product.productOptions = fields.productOptions;







        // Folder to save all the images of the product 
        const folderName = fields.sku;
        createDir(path.join(__dirname, '../public/products/') + folderName);

        // An array to store multiple images
        let images = [];

        //if images exist
        if (files.images && files.images != '') {
            // loop to go through every image
            for (image of files.images) {

                // temporary location of the image
                let oldPath = image.path;
                // index of the dot before the image extension
                let indexOfDot = image.name.indexOf('.');
                // Name of the image
                let name = _.kebabCase(image.name.substring(0, indexOfDot));
                // location of the image to be stored
                let location = 'products\\' + folderName + '\\';
                // extension of the image
                let extension = image.name.substring(indexOfDot);
                // New location of the image
                let newPath = path.join(path.dirname(oldPath), location + name + extension);

                // Adding the image info to the array
                images.push({
                    name,
                    extension,
                    location
                });

                // moving the image from temporary location to the new location
                fs.rename(oldPath, newPath, (err) => {
                    if (err) {
                        return res.status(400).json({
                            "errors": [{
                                "msg": "Image could not be uploaded",
                                "param": "images"
                            }]
                        });
                    }
                });

            }
        }


        product.images = images;


        product.save(function(err, data) {
            if (err) {
                if (images.length != 0)
                    removeDir(folderName);
                return res.status(400).json({
                    "errors": errorHandler(err)
                });
            }

            res.json({ data });
        });




    });
}

// This method will create the directory
// @param: String with the folder name starting from root
function createDir(directoryPath) {
    // Create the folder if not created yet
    try {
        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath);
        }
    } catch (err) {
        console.error(err);
    }
}

// This method will remove the directory
// @param: String with the folder name starting from root
function removeDir(directoryPath) {
    if (fs.existsSync(directoryPath)) {
        fs.readdirSync(directoryPath).forEach((file, index) => {
            const curPath = path.join(directoryPath, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                // recurse
                deleteFolderRecursive(curPath);
            } else {
                // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(directoryPath);
    }
}