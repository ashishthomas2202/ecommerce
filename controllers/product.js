const formidable = require('formidable');
const _ = require('lodash');
const Product = require('../models/product');
const fs = require('fs');
const path = require('path');

exports.create = function(req, res) {


    // Initializing the form
    let form = new formidable.IncomingForm();
    form.encoding = 'utf-8'; // code
    form.keepExtensions = true; // keep the extension
    form.multiples = true;
    form.uploadDir = __dirname + '../../'; //File storage path Finally, pay attention to adding '/'  Otherwise it will be stored under public


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
        // Folder to save all the images of the product 
        const folderName = 'public\\products\\' + fields.sku;


        createDir(folderName);


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
                let location = folderName + '\\';
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



        const product = new Product();

        product.sku = fields.sku;
        product.name = fields.name;
        product.ribbon = fields.ribbon;
        product.categoryId = fields.categoryId;
        product.images = images;
        product.costPrice = fields.costPrice;
        product.margin = fields.margin;
        product.stickerPrice = fields.stickerPrice;
        product.onSale = fields.onSale;
        product.discount = {
            amount: fields.discountAmount,
            symbol: fields.discountSymbol
        };
        product.discription = fields.description;

        console.log(fields.additionalInfoTitle);



        console.log(product);




        res.json({ avatar: images });

        //I am here to change the file name uniformly for storage convenience <username>.jpg


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