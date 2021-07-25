const formidable = require('formidable');
const path = require('path');
const _ = require('lodash');
const fs = require('fs');

const Product = require('../models/product');
const { check } = require('../validators/product');
const { errorHandler } = require('../helpers/dbErrorHandler');

const productDirectory = path.join(__dirname, '../public/products');
const tempFolderPath = path.join(productDirectory, 'temp');



exports.productById = function(req, res, next, id) {

    Product.findById(id).exec((err, product) => {
        if (err || !product)
            return res.status(400).json({
                "errors": [{
                    "msg": "Product not found",
                    "param": "id"
                }]
            });
        req.product = product;
        next();
    });
}



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
                });
            }

            let jsonData = JSON.parse(fields.jsonData);

            //***************** Parsing Fields *************************

            let product = new Product();
            let { sku, name, ribbon, categoryId, onePrice, costPrice, margin, stickerPrice, onSale, discount, description, additionalInfo, productOptions } = jsonData;



            /******** sku validation ********/
            check('create', 'sku', { sku });
            //Assigning the sku value to the product object
            product.sku = sku;
            /******** sku validation ends ********/



            /************* name validation *************/
            check('create', 'name', { name });
            //Assigning the name to the product object
            product.name = name;
            /************* name validation ends *************/



            /************* ribbon validation *************/
            if (ribbon) {
                check('create', 'ribbon', { ribbon });
                //Assigning the ribbon to the product object
                product.ribbon = ribbon;
            }
            /************* ribbon validation ends *************/



            /************* categoryId validation *************/
            check('create', 'categoryId', { categoryId });
            //Assigning the categoryId to the product object
            product.categoryId = categoryId;
            /************* categoryId validation ends *************/



            /************* onePrice validation *************/
            check('create', 'onePrice', { onePrice });
            //Assigning the onePrice to the product object
            product.onePrice = onePrice;
            /************* onePrice validation ends *************/



            /************* costPrice validation *************/
            if (onePrice) {
                check('create', 'costPrice', { costPrice });
                //Assigning the costPrice to the product object
                product.costPrice = costPrice;
            }
            /************* costPrice validation ends *************/



            /************* stickerPrice validation *************/
            if (onePrice) {
                check('create', 'stickerPrice', { stickerPrice, costPrice });
                //Assigning the stickerPrice to the product object
                product.stickerPrice = stickerPrice;
            }
            /************* stickerPrice validation ends *************/



            /************* margin validation *************/
            if (onePrice) {
                check('create', 'margin', { margin, costPrice, stickerPrice });
                //Assigning the margin to the product object
                product.margin = margin;
            }
            /************* margin validation ends *************/



            /************* onSale validation *************/
            check('create', 'onSale', { onSale });
            //Assigning the onSale to the product object
            product.onSale = onSale;
            /************* onSale validation ends *************/



            /************* discount validation *************/
            if (onSale) {
                check('create', 'discount', { discount });
                //Assigning the discount to the product object
                product.discount = discount;
            }
            /************* discount validation ends *************/



            /************* description validation *************/
            check('create', 'description', { description });
            //Assigning the description to the product object
            product.description = description;
            /************* description validation ends *************/



            /************* additionalInfo validation *************/
            if (additionalInfo) {
                check('create', 'additionalInfo', { additionalInfo });
                //Assigning the additionalInfo to the product object
                product.additionalInfo = additionalInfo;
            }
            /************* additionalInfo validation ends *************/



            /************* productOptions validation *************/
            if (productOptions) {
                check('create', 'productOptions', { productOptions, onePrice, costPrice, stickerPrice, margin });
                //Assigning the productOptions to the product object
                product.productOptions = productOptions;
            }
            /************* productOptions validation ends *************/



            /************* images validation *************/
            // Folder to save all the images of the product 
            const folderName = _.kebabCase(sku);
            let productDir = path.join(productDirectory, folderName);

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
                                directoryCreated: true,
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
                        });
                    else if (err.code === 'ENOENT')
                        throw JSON.stringify({
                            message: 'Invalid image path',
                            param: 'Image Directory',
                            directoryCreated: true,
                            productDir: productDir,
                        });
                    else {
                        throw err;
                    }
                }
            }
            //Assigning the images to the product object
            product.images = images;
            /************* images validation ends *************/



            product.save((err, data) => {
                if (err) {
                    // removeErrorFiles(files.images, productDir);
                    return res.status(400).json({
                        "errors": errorHandler(err)
                    });
                }
                return res.json({
                    data,
                    msg: 'Product successfully created'
                });
            })

        } catch (err) {

            try {


                return handleError('create', res, err, fileDeleteList);
            } catch (err) {
                return res.status(400).json({
                    "errors": [{
                        "msg": "Invalid JSON request",
                        "param": "JSON Object"
                    }]
                });
            }
        }
    });
}


function handleError(request, res, err, fileDeleteList) {
    switch (request) {
        case 'create':
            try {
                let error = JSON.parse(err);
                let fileDeleteList = [];

                if (error.directoryCreated) {
                    if (files && files.images) {

                    }
                } else {
                    if (files && files.images) {}
                }
            } catch (err) {
                console.log(err);
            }
            if (fileDeleteList)
                deleteFiles(fileDeleteList);

            return res.status(400).json({
                "errors": [{
                    "msg": err.message,
                    "param": err.param
                }]
            });
            break;
        case 'update':
            break;
    }
}