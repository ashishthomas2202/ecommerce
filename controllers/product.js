const formidable = require('formidable');
const path = require('path');
const _ = require('lodash');
const fs = require('fs');

const { uploadFile, deleteFile } = require('../s3');

const Product = require('../models/product');
const Category = require('../models/category');
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




exports.addCategoryId = function(req, res, next) {

    Category.findOne({ name: "All Products" }).exec((err, category) => {

        if (err || !category)
            return res.status(400).json({
                "errors": [{
                    "msg": "All Product category not found. Please create a category \"All Products\"",
                    "param": "category"
                }]
            });
        req.categoryId = category._id;
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


    let allProductCategoryId = req.categoryId;

    // parsing the form data
    form.parse(req, async function(err, fields, files) {
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
            if (!Array.isArray(files.images))
                files.images = [files.images];

            //***************** Parsing Fields *************************
            let tempImages = files.images
            let product = new Product();
            let { sku, name, ribbon, categoryId, sold, onePrice, costPrice, margin, stickerPrice, onSale, discount, description, additionalInfo, productOptions } = jsonData;


            /******** sku validation ********/
            check('sku', { sku, files: tempImages });
            //Assigning the sku value to the product object
            product.sku = sku;
            /******** sku validation ends ********/



            /************* name validation *************/
            check('name', { name, files: tempImages });
            //Assigning the name to the product object
            product.name = name;
            /************* name validation ends *************/



            /************* ribbon validation *************/
            if (ribbon) {
                check('ribbon', { ribbon, files: tempImages });
                //Assigning the ribbon to the product object
                product.ribbon = ribbon;
            }
            /************* ribbon validation ends *************/



            /************* categoryId validation *************/
            check('categoryId', { categoryId, allProductCategoryId, files: tempImages });
            //Assigning the categoryId to the product object
            product.categoryId = categoryId;
            /************* categoryId validation ends *************/



            /************* sold validation *************/
            check('sold', { sold, files: tempImages });
            //Assigning the sold to the product object
            if (sold)
                product.sold = sold;
            /************* sold validation ends *************/



            /************* onePrice validation *************/
            check('onePrice', { onePrice, files: tempImages });
            //Assigning the onePrice to the product object
            product.onePrice = onePrice;
            /************* onePrice validation ends *************/



            /************* costPrice validation *************/
            if (onePrice) {
                check('costPrice', { costPrice, files: tempImages });
                //Assigning the costPrice to the product object
                product.costPrice = costPrice;
            }
            /************* costPrice validation ends *************/



            /************* stickerPrice validation *************/
            if (onePrice) {
                check('stickerPrice', { stickerPrice, costPrice, files: tempImages });
                //Assigning the stickerPrice to the product object
                product.stickerPrice = stickerPrice;
            }
            /************* stickerPrice validation ends *************/



            /************* margin validation *************/
            if (onePrice) {
                check('margin', { margin, costPrice, stickerPrice, files: tempImages });
                //Assigning the margin to the product object
                product.margin = margin;
            }
            /************* margin validation ends *************/



            /************* onSale validation *************/
            check('onSale', { onSale, files: tempImages });
            //Assigning the onSale to the product object
            product.onSale = onSale;
            /************* onSale validation ends *************/



            /************* discount validation *************/
            if (onSale) {
                check('discount', { discount, files: tempImages });
                //Assigning the discount to the product object
                product.discount = discount;
            }
            /************* discount validation ends *************/



            /************* description validation *************/
            check('description', { description, files: tempImages });
            //Assigning the description to the product object
            product.description = description;
            /************* description validation ends *************/



            /************* additionalInfo validation *************/
            if (additionalInfo) {
                check('additionalInfo', { additionalInfo, files: tempImages });
                //Assigning the additionalInfo to the product object
                product.additionalInfo = additionalInfo;
            }
            /************* additionalInfo validation ends *************/



            /************* productOptions validation *************/
            if (productOptions) {
                check('productOptions', { productOptions, onePrice, costPrice, stickerPrice, margin, files: tempImages });
                //Assigning the productOptions to the product object
                product.productOptions = productOptions;
            }
            /************* productOptions validation ends *************/



            /************* images validation *************/

            //Array to store the info of the image to be added
            let imageList = [];
            // checking if the image is present in the form
            if (files.images && files.images != '') {
                try {
                    //Loop to go through each image
                    for (let image of files.images) {
                        // temporary location of the image
                        let location = image.path;
                        // index of the dot before the image extension
                        let indexOfDot = image.name.indexOf('.');
                        // Name of the image
                        let name = _.kebabCase(image.name.substring(0, indexOfDot) + Date.now());
                        // extension of the image
                        let extension = image.name.substring(indexOfDot);

                        // checking for the file extension
                        if (!(extension.toLowerCase() === '.jpg' || extension.toLowerCase() === '.jpeg' || extension.toLowerCase() === '.bmp' || extension.toLowerCase() === '.png' || extension.toLowerCase() === '.gif' || extension.toLowerCase() === '.tiff' || extension.toLowerCase() === '.svg' || extension.toLowerCase() === '.webp')) {
                            throw JSON.stringify({
                                message: 'Invalid image format',
                                param: 'images',
                                files: tempImages
                            });
                        }
                        // adding images info in an array
                        imageList.push({
                            location,
                            name,
                            extension,
                            type: image.type
                        });
                    }
                    // array to store the image data with the aws location
                    let images = [];
                    // loop to go through each image
                    for (let image of imageList) {
                        try {
                            // uploading files to server
                            const result = await uploadFile(image);
                            // adding info to the image array
                            images.push({
                                name: image.name,
                                extension: image.extension,
                                path: result.Location
                            })

                            // deleting the images from temp folder
                            fs.unlinkSync(image.location);
                        } catch (err) {
                            console.log(err);
                        }
                    }
                    //assigning the image data in the product object
                    product.images = images;
                } catch (err) {
                    throw err;
                }
            }
            /************* images validation ends *************/



            // saving the product
            product.save((err, data) => {
                if (err) {
                    // console.log(product)
                    for (let image of product.images) {
                        try {
                            deleteFile(image);
                        } catch (err) {
                            console.log(err);
                        }
                    }
                    return res.status(400).json({
                        "errors": errorHandler(err)
                    });
                }
                return res.json({
                    data,
                    msg: 'Product successfully created'
                });
            });

        } catch (err) {
            return handleError(res, err);
        }
    });
}




exports.read = function(req, res) {

    // coping the product data
    let product = JSON.parse(JSON.stringify(req.product));

    // check if the onePrice is true
    if (product.onePrice) {
        // creating a new key with name salePrice
        product["salePrice"] = product.costPrice + product.margin;
        // removing the costPrice and margin from the product
        product.costPrice = undefined;
        product.margin = undefined;
    }
    // onePrice is false
    else {
        // loop to go through each productOptions
        for (const option of product.productOptions) {
            // loop to go through each varient
            for (const varient of option.varients) {
                // loop to go through each stock
                for (const stock of varient.stock) {
                    // creating the new key with name salePrice
                    stock["salePrice"] = stock.costPrice + stock.margin;
                    // removing costPrice and margin from the product
                    stock.costPrice = undefined;
                    stock.margin = undefined;
                }
            }
        }
    }

    return res.json(product);
}




exports.update = function(req, res) {

    //Initializing the formidable
    let form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.keepExtensions = true;
    //accept multiple files
    form.multiples = true;
    // directory to upload files
    form.uploadDir = tempFolderPath;


    let allProductCategoryId = req.categoryId;

    // parsing the form data
    form.parse(req, async function(err, fields, files) {
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
            console.log(jsonData)
            if (!Array.isArray(files.images))
                files.images = [files.images];
            //***************** Parsing Fields *************************
            let tempImages = files.images
            let product = req.product;
            let { sku, name, ribbon, categoryId, sold, onePrice, costPrice, margin, stickerPrice, onSale, discount, description, additionalInfo, productOptions, deleteImages } = jsonData;



            /******** sku validation ********/
            if (!(sku === product.sku)) {
                check('sku', { sku, files: tempImages });
                //Assigning the sku value to the product object
                product.sku = sku;
            }
            /******** sku validation ends ********/



            /************* name validation *************/
            if (!(name === product.name)) {
                check('name', { name, files: tempImages });
                //Assigning the name to the product object
                product.name = name;
            }
            /************* name validation ends *************/



            /************* ribbon validation *************/
            if (ribbon) {
                if (!(ribbon === product.ribbon)) {
                    check('ribbon', { ribbon, files: tempImages });
                    //Assigning the ribbon to the product object
                    product.ribbon = ribbon;
                }
            } else {
                product.ribbon = undefined;
            }
            /************* ribbon validation ends *************/



            /************* categoryId validation *************/
            if (!(categoryId === product.categoryId)) {
                check('categoryId', { categoryId, allProductCategoryId, files: tempImages });
                //Assigning the categoryId to the product object
                product.categoryId = categoryId;
            }
            /************* categoryId validation ends *************/



            /************* sold validation *************/
            check('sold', { sold, files: tempImages });
            //Assigning the sold to the product object
            if (sold)
                product.sold = sold;
            /************* sold validation ends *************/



            // /************* onePrice validation *************/
            if (!(onePrice === product.onePrice)) {
                check('onePrice', { onePrice, files: tempImages });
                //Assigning the onePrice to the product object
                product.onePrice = onePrice;
            }
            // /************* onePrice validation ends *************/



            /************* costPrice validation *************/
            if (onePrice) {
                if (!(costPrice === product.costPrice)) {
                    check('costPrice', { costPrice, files: tempImages });
                    //Assigning the costPrice to the product object
                    product.costPrice = costPrice;
                }
            } else {
                //Assigning the costPrice to the product object
                product.costPrice = undefined;
            }
            /************* costPrice validation ends *************/



            /************* stickerPrice validation *************/
            if (onePrice) {
                if (!(stickerPrice === product.stickerPrice)) {
                    check('stickerPrice', { stickerPrice, costPrice, files: tempImages });
                    //Assigning the stickerPrice to the product object
                    product.stickerPrice = stickerPrice;
                }
            } else {
                //Assigning the stickerPrice to the product object
                product.stickerPrice = undefined;
            }
            /************* stickerPrice validation ends *************/



            /************* margin validation *************/
            if (onePrice) {
                if (!(margin === product.margin)) {
                    check('margin', { margin, costPrice, stickerPrice, files: tempImages });
                    //Assigning the margin to the product object
                    product.margin = margin;
                }
            } else {
                //Assigning the margin to the product object
                product.margin = undefined;
            }
            /************* margin validation ends *************/



            /************* onSale validation *************/
            if (!(onSale === product.onSale)) {
                check('onSale', { onSale, files: tempImages });
                //Assigning the onSale to the product object
                product.onSale = onSale;
            }
            /************* onSale validation ends *************/



            /************* discount validation *************/
            if (onSale) {
                if (!(discount === product.discount)) {
                    check('discount', { discount, files: tempImages });
                    //Assigning the discount to the product object
                    product.discount = discount;
                }
            } else {
                //Assigning the discount to the product object
                product.discount = undefined;
            }
            /************* discount validation ends *************/



            /************* description validation *************/
            if (!(description === product.description)) {
                check('description', { description, files: tempImages });
                //Assigning the description to the product object
                product.description = description;
            }
            /************* description validation ends *************/



            /************* additionalInfo validation *************/
            if (additionalInfo) {
                if (!(additionalInfo === product.additionalInfo)) {
                    check('additionalInfo', { additionalInfo, files: tempImages });
                    //Assigning the additionalInfo to the product object
                    product.additionalInfo = additionalInfo;
                }
            } else {
                //Assigning the additionalInfo to the product object
                product.additionalInfo = undefined;
            }
            /************* additionalInfo validation ends *************/



            /************* productOptions validation *************/
            if (productOptions) {
                if (!(productOptions === product.productOptions)) {
                    check('productOptions', { productOptions, onePrice, costPrice, stickerPrice, margin, files: tempImages });
                    //Assigning the productOptions to the product object
                    product.productOptions = productOptions;
                }
            } else {
                //Assigning the additionalInfo to the product object
                product.productOptions = undefined;
            }
            /************* productOptions validation ends *************/



            /************* images validation *************/
            // array to store images info
            let imageList = [];

            // checking if the image is present in the form
            if (files.images && files.images != '') {

                try {
                    //Loop to go through each image
                    for (let image of files.images) {
                        // temporary location of the image
                        let location = image.path;
                        // index of the dot before the image extension
                        let indexOfDot = image.name.indexOf('.');
                        // Name of the image
                        let name = _.kebabCase(image.name.substring(0, indexOfDot) + Date.now());
                        // extension of the image
                        let extension = image.name.substring(indexOfDot);

                        // checking for the file extension
                        if (!(extension.toLowerCase() === '.jpg' || extension.toLowerCase() === '.jpeg' || extension.toLowerCase() === '.bmp' || extension.toLowerCase() === '.png' || extension.toLowerCase() === '.gif' || extension.toLowerCase() === '.tiff' || extension.toLowerCase() === '.svg' || extension.toLowerCase() === '.webp')) {
                            throw JSON.stringify({
                                message: 'Invalid image format',
                                param: 'images',
                                files: tempImages
                            });
                        }
                        // adding images info in an array
                        imageList.push({
                            location,
                            name,
                            extension,
                            type: image.type
                        });
                    }

                    // array to store the image data with the aws location
                    let images = [];
                    // loop to go through each image
                    for (let image of imageList) {
                        try {
                            // uploading files to server
                            const result = await uploadFile(image);
                            // adding info to the image array
                            images.push({
                                name: image.name,
                                extension: image.extension,
                                path: result.Location
                            })

                            // deleting the images from temp folder
                            fs.unlinkSync(image.location);
                        } catch (err) {
                            console.log(err);
                        }
                    }
                    //assigning the image data in the product object
                    product.images.forEach((element) => {
                        images.push(element);
                    });

                    product.images = images;
                } catch (err) {
                    throw err;
                }
            }
            /************* images validation ends *************/



            /************* deleteImages validation *************/
            if (deleteImages) {

                if (Array.isArray(deleteImages)) {

                    // getting the actual images list
                    let imageList = product.images;

                    // removing the info of image deleted from the list
                    for (const deletedImage of deleteImages) {
                        for (let image of imageList) {
                            if (String(deletedImage._id) === String(image._id)) {
                                imageList.remove(image);
                            }
                        }
                    }
                    // Saving the updated list
                    product.images = imageList;
                }
            }
            /************* deleteImages validation ends *************/

            //saving product
            product.save((err, data) => {
                if (err) {
                    console.log(err);
                    return res.status(400).json({
                        "errors": errorHandler(err)
                    });
                }

                for (let image of deleteImages) {
                    try {
                        deleteFile(image)
                    } catch (err) {
                        console.log(err);
                    }
                }

                return res.json({
                    data,
                    msg: 'Product successfully updated'
                });
            })

        } catch (err) {
            return handleError(res, err);
        }
    });
}




exports.remove = function(req, res) {

    // variavle to store the product from request
    let product = req.product

    // trying to remove the product from directory
    product.remove((err, data) => {
        if (err)
            return res.status(400).json({
                "errors": errorHandler(err)
            });
        try {
            // deleting the product folder and images
            removeProductFolder(path.join(productDirectory, _.kebabCase(data.sku)));
            return res.json({
                data,
                msg: 'Product successfully deleted'
            });
        } catch (err) {
            return handleError(res, err);
        }
    });
}



/**
 * list by Sell/Arrival
 * by sell = /products/list?sortBy=sold&order=desc&limit=4
 * by arrival = /products/list?sortBy=createdAt&order=desc&limit=4
 * if no parameter are sent, then all products are returned
 * 
 * order: asc,desc
 * sortBy: CreatedAt,sold
 */
exports.list = function(req, res) {

    let order = req.query.order ? req.query.order : 'asc';
    let sortBy = req.query.sortBy ? req.query.sortBy : '_id';
    let limit = req.query.limit ? parseInt(req.query.limit) : undefined;

    Product.find()
        .populate('categoryId')
        .sort([
            [sortBy, order]
        ])
        .limit(limit)
        .exec((err, data) => {
            if (err || !data)
                return res.status(400).json({
                    "errors": [{
                        "msg": "Products not found",
                        "param": "list"
                    }]
                });


            return res.json({
                data,
                msg: 'Product list sent successfully'
            });

        });

}




/**
 * 
 */
exports.relatedList = function(req, res) {

    let limit = req.query.limit ? parseInt(req.query.limit) : undefined;

    let categoryIdParam = [];

    for (let category of req.product.categoryId) {
        if (!(String(category) === String(req.categoryId))) {
            categoryIdParam.push({ categoryId: category._id })
        }
    }

    categoryIdParam = categoryIdParam ? categoryIdParam : String(req.categoryId);

    console.log(categoryIdParam)
    Product.find({
            _id: { $ne: req.product },
            $or: categoryIdParam,
        })
        .limit(limit)
        .populate('categoryId')
        .exec((err, data) => {
            if (err || !data)
                return res.status(400).json({
                    "errors": [{
                        "msg": "Related Products not found",
                        "param": "related list"
                    }]
                });


            return res.json({
                data,
                msg: 'Related product list sent successfully'
            });
        });
}



function handleError(res, err, files) {

    try {
        let customError = JSON.parse(err);

        if (customError.files) {
            for (let file of customError.files) {
                try {
                    fs.unlinkSync(file.path);
                } catch (err) {
                    console.log(err);
                }
            }
        }
        return res.status(400).json({
            "errors": [{
                "msg": customError.message,
                "param": customError.param
            }]
        });

    } catch (err) {
        console.log(err)
            // removeErrorFiles(files.images);
        return res.status(400).json({
            "errors": [{
                "msg": "Invalid JSON request",
                "param": "JSON Object"
            }]
        });
    }

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

            if (!Array.isArray(images)) {
                images = [images];
            }
            // loop to go through each image in temp folder
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
        if (!Array.isArray(images)) {
            images = [images];
        }
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

function removeProductFolder(productDir) {

    let deleteList = [];
    try {
        // getting all the file name contained in the directory
        let productImageNames = fs.readdirSync(productDir);

        //loop to add file names with the total path in the delete list
        for (const productImageName of productImageNames) {
            deleteList.push(path.join(productDir, productImageName));
        }
        // Deleting the images
        deleteFiles(deleteList);

        // Deleting the directory due to the error
        deleteDir(productDir);

    } catch (err) {
        if (err.code === 'ENOENT')
            throw JSON.stringify({
                message: 'Invalid image path',
                param: 'Image Directory',
            });
    }
}

function deleteFiles(files) {

    try {
        for (const file of files) {
            fs.unlinkSync(file);
        }

    } catch (err) {
        throw err;
    }
}

function deleteDir(path) {
    try {
        fs.rmdirSync(path);
    } catch (err) {
        console.log(err);
    }
}