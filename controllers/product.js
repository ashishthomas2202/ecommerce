const formidable = require('formidable');
const path = require('path');
const _ = require('lodash');
const fs = require('fs');

const Product = require('../models/product');
const { check } = require('../validators/product');
const { errorHandler } = require('../helpers/dbErrorHandler');

const tempFolderPath = path.join(__dirname, '../public/products/temp');

exports.create = function(req, res) {

    //Initializing the formidable
    let form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.keepExtensions = true;
    //accept multiple files
    form.multiples = true;
    // directory to upload files
    form.uploadDir = tempFolderPath;


    // parsing the form data
    form.parse(req, function(err, fields, files) {
        try {

            // if there is any error occurs in parsing form
            if (err) {
                throw JSON.stringify({
                    message: 'Image could not be uploaded',
                    param: 'images',
                    files: files,
                    fileTransfer: 'false'
                });
            }

            let jsonData = JSON.parse(fields.jsonData);
            console.log(jsonData);

            //***************** Parsing Fields *************************

            let product = new Product();
            let { sku, name, ribbon, categoryId, onePrice, costPrice, margin, stickerPrice, onSale, discount, description, additionalInfo, productOptions } = jsonData;


            /******** sku validation ********/
            check('sku', { sku, files });
            //Assigning the sku value to the product object
            product.sku = sku;
            /******** sku validation ends ********/



            /************* name validation *************/
            check('name', { name, files });
            //Assigning the name to the product object
            product.name = name;
            /************* name validation ends *************/



            /************* ribbon validation *************/
            if (ribbon) {
                check('ribbon', { ribbon, files });
                //Assigning the ribbon to the product object
                product.ribbon = ribbon;
            }
            /************* ribbon validation ends *************/



            /************* categoryId validation *************/
            check('categoryId', { categoryId, files });
            //Assigning the categoryId to the product object
            product.categoryId = categoryId;
            /************* categoryId validation ends *************/



            /************* onePrice validation *************/
            check('onePrice', { onePrice, files });
            //Assigning the onePrice to the product object
            product.onePrice = onePrice;
            /************* onePrice validation ends *************/



            /************* costPrice validation *************/
            if (onePrice) {
                check('costPrice', { costPrice, files });
                //Assigning the costPrice to the product object
                product.costPrice = costPrice;
            }
            /************* costPrice validation ends *************/



            /************* stickerPrice validation *************/
            if (onePrice) {
                check('stickerPrice', { stickerPrice, costPrice, files });
                //Assigning the stickerPrice to the product object
                product.stickerPrice = stickerPrice;
            }
            /************* stickerPrice validation ends *************/



            /************* margin validation *************/
            if (onePrice) {
                check('margin', { margin, costPrice, stickerPrice, files });
                //Assigning the margin to the product object
                product.margin = margin;
            }
            /************* margin validation ends *************/



            /************* onSale validation *************/
            check('onSale', { onSale, files });
            //Assigning the onSale to the product object
            product.onSale = onSale;
            /************* onSale validation ends *************/



            /************* discount validation *************/
            if (onSale) {
                check('discount', { discount, files });
                //Assigning the discount to the product object
                product.discount = discount;
            }
            /************* discount validation ends *************/



            /************* description validation *************/
            check('description', { description, files });
            //Assigning the description to the product object
            product.description = description;
            /************* description validation ends *************/



            /************* additionalInfo validation *************/
            if (additionalInfo) {
                check('additionalInfo', { additionalInfo, files });
                //Assigning the additionalInfo to the product object
                product.additionalInfo = additionalInfo;
            }
            /************* additionalInfo validation ends *************/



            /************* productOptions validation *************/
            if (productOptions) {
                check('productOptions', { productOptions, onePrice, costPrice, stickerPrice, margin, files });
                //Assigning the productOptions to the product object
                product.productOptions = productOptions;
            }
            /************* productOptions validation ends *************/



            /************* images validation *************/
            // Folder to save all the images of the product 
            const folderName = _.kebabCase(sku);
            let productDir = path.join(__dirname, '../public/products', folderName);

            // array to store images info
            let images = [];

            // checking if the image is present in the form
            if (files.images && files.images != '') {
                try {
                    let imageList = [];
                    //Creating the directory to store the images
                    fs.mkdirSync(productDir);

                    //Loop to go through each image
                    for (let image of files.images) {
                        // temporary location of the image
                        let oldPath = image.path;
                        // index of the dot before the image extension
                        let indexOfDot = image.name.indexOf('.');
                        // Name of the image
                        let name = _.kebabCase(image.name.substring(0, indexOfDot));
                        // extension of the image
                        let extension = image.name.substring(indexOfDot);
                        // New location of the image
                        let newPath = path.join(tempFolderPath, '../', folderName, name + extension);

                        // checking for the file extension
                        if (!(extension.toLowerCase() === '.jpg' || extension.toLowerCase() === '.jpeg' || extension.toLowerCase() === '.bmp' || extension.toLowerCase() === '.png' || extension.toLowerCase() === '.gif' || extension.toLowerCase() === '.tiff' || extension.toLowerCase() === '.svg' || extension.toLowerCase() === '.webp')) {
                            throw JSON.stringify({
                                message: 'Invalid image format',
                                param: 'images',
                                productDir: productDir,
                                files: files
                            });
                        }
                        // adding images info in an array
                        imageList.push({
                            oldPath,
                            name,
                            extension,
                            folderName,
                            newPath,
                        });
                    }
                    // loop to go through each image one by one
                    for (let image of imageList) {
                        //moving image from temp folder to the product folder
                        fs.renameSync(image.oldPath, image.newPath);
                        images.push({
                            name: image.name,
                            extension: image.extension,
                            path: image.newPath
                        });
                    }
                } catch (err) {
                    if (err.code === 'EEXIST')
                        throw JSON.stringify({
                            message: 'sku already exist',
                            param: 'sku',
                            files: files,
                        });
                    else if (err.code === 'ENOENT')
                        throw JSON.stringify({
                            message: 'Invalid image path',
                            param: 'Image Directory',
                            productDir: productDir,
                            files: files
                        });
                    else {
                        throw err;
                    }
                }
            }
            //Assigning the images to the product object
            product.images = images;

            product.save((err, data) => {
                if (err) {
                    removeErrorFiles(files.images, productDir);
                    return res.status(400).json({
                        "errors": errorHandler(err)
                    });
                }
                return res.json({ data });

            })




            /************* images validation ends *************/

        } catch (err) {
            return handleError(res, err);
        }

    });
}

function handleError(res, err) {

    // parsing the error data
    let customError = JSON.parse(err);

    // files present
    if (customError.files) {

        // product directory is present
        if (customError.productDir) {
            removeErrorFiles(customError.files.images, customError.productDir);
        }
        // product directory is not present
        else {
            removeErrorFiles(customError.files.images);
        }
    }

    return res.status(400).json({
        "errors": [{
            "msg": customError.message,
            "param": customError.param
        }]
    });
}

function removeErrorFiles(images, productDir) {

    // array to store the files to be deleted
    let deleteList = [];

    // Product directory exists
    if (productDir) {
        try {

            // getting all the file name contained in the directory
            let productImageNames = fs.readdirSync(productDir);

            //loop to add file names with the total path in the delete list
            for (const productImageName of productImageNames) {
                deleteList.push(path.join(productDir, productImageName));
            }


            for (const image of images) {

                // index of the dot before the image extension
                let indexOfDot = image.name.indexOf('.');
                // Name of the image
                let name = _.kebabCase(image.name.substring(0, indexOfDot));

                let found = false;

                // loop to go through each product name
                for (const productImageName of productImageNames) {

                    // index of the dot before the image extension
                    let dotIndex = productImageName.indexOf('.');
                    // Name of the image
                    let productName = _.kebabCase(productImageName.substring(0, dotIndex));

                    // image was moved from temp folder to product directory
                    if (name === productName) {
                        found = true;
                        break;
                    }
                }

                // adding the image path to delete it from the temp folder
                if (!found)
                    deleteList.push(image.path);
            }

        } catch (err) {
            console.log(err);
        }
    }
    //Product directory doesn't exist
    else {
        // Loop to go through every image and add its path in the deleteList
        for (const image of images) {
            deleteList.push(image.path);
        }
    }

    // Deleting the images
    deleteFiles(deleteList);

    // Product directory exists, Deleting the directory due to the error
    if (productDir)
        deleteDir(productDir);
}

function deleteFiles(files) {

    try {
        for (const file of files) {
            fs.unlinkSync(file);
        }

    } catch (err) {
        console.log(err);
    }
}

function deleteDir(path) {
    try {
        fs.rmdirSync(path);
    } catch (err) {
        console.log(err);
    }
}