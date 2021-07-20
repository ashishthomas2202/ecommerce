const Product = require('../models/product');
const formidable = require('formidable');
const path = require('path');
const _ = require('lodash');
const fs = require('fs');

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


            //***************** Parsing Fields *************************

            let product = new Product();
            let { sku, name, ribbon, categoryId, onePrice, costPrice, margin, stickerPrice, onSale, discount, description, additionalInfo, productOptions } = fields;


            /******** sku validation ********/
            // sku doesn't exist or isEmpty
            if (checkRequired(sku))
                throw JSON.stringify({
                    message: 'sku is required',
                    param: 'sku',
                    files: files,
                });
            // sku contains less than 3 characters or  more than 15 characters
            if (!checkLength(sku, 3, 15))
                throw JSON.stringify({
                    message: 'sku must be between 3 to 15 characters',
                    param: 'sku',
                    files: files
                });
            //Assigning the sku value to the product object
            product.sku = sku;
            /******** sku validation ends ********/



            /************* name validation *************/
            // name doesn't exist or isEmpty
            if (checkRequired(name))
                throw JSON.stringify({
                    message: 'name is required',
                    param: 'name',
                    files: files,
                });
            // name contains less than 3 characters or  more than 60 characters
            if (!checkLength(name, 3, 60))
                throw JSON.stringify({
                    message: 'name must be between 3 to 60 characters',
                    param: 'name',
                    files: files,
                });
            //Assigning the name to the product object
            product.name = name;
            /************* name validation ends *************/



            /************* ribbon validation *************/
            // ribbon contains less than 3 characters or  more than 60 characters
            if (ribbon) {
                if (!checkLength(ribbon, 3, 20))
                    throw JSON.stringify({
                        message: 'ribbon must be between 3 to 20 characters',
                        param: 'ribbon',
                        files: files,
                    });
                //Assigning the ribbon to the product object
                product.ribbon = ribbon;
            }
            /************* ribbon validation ends *************/



            /************* categoryId validation *************/
            // categoryId doesn't exist or isEmpty
            if (checkRequired(categoryId))
                throw JSON.stringify({
                    message: 'categoryId is required',
                    param: 'categoryId',
                    files: files,
                });
            //Assigning the categoryId to the product object
            product.categoryId = categoryId;
            /************* categoryId validation ends *************/



            /************* onePrice validation *************/
            // onePrice doesn't exist or isEmpty
            if (checkRequired(onePrice))
                throw JSON.stringify({
                    message: 'onePrice is required',
                    param: 'onePrice',
                    files: files,
                });
            //Assigning the onePrice to the product object
            product.onePrice = onePrice;
            /************* onePrice validation ends *************/



            /************* costPrice validation *************/
            // costPrice doesn't exist or isEmpty
            if (checkRequired(costPrice))
                throw JSON.stringify({
                    message: 'costPrice is required',
                    param: 'costPrice',
                    files: files,
                });
            // costPrice must be greater than 0 and less than 99999
            if (!checkValue(costPrice, 0.01, 99999))
                throw JSON.stringify({
                    message: 'costPrice must be greater than 0.01 and less than 99999',
                    param: 'costPrice',
                    files: files,
                });
            //Assigning the costPrice to the product object
            product.costPrice = costPrice;
            /************* costPrice validation ends *************/



            /************* stickerPrice validation *************/
            // stickerPrice doesn't exist or isEmpty
            if (checkRequired(stickerPrice))
                throw JSON.stringify({
                    message: 'stickerPrice is required',
                    param: 'stickerPrice',
                    files: files,
                });
            // stickerPrice must be greater than costPrice and less than 99999
            if (!checkValue(stickerPrice, Number(costPrice) + 0.01, 99999))
                throw JSON.stringify({
                    message: 'stickerPrice must be greater than ' + costPrice + ' and less than 99999',
                    param: 'stickerPrice',
                    files: files,
                });
            //Assigning the stickerPrice to the product object
            product.stickerPrice = stickerPrice;
            /************* stickerPrice validation ends *************/



            /************* margin validation *************/
            // margin doesn't exist or isEmpty
            if (checkRequired(margin))
                throw JSON.stringify({
                    message: 'margin is required',
                    param: 'margin',
                    files: files,
                });
            // margin must be greater than 0 and less than stickerPrice - cost price
            if (!checkValue(margin, 0.01, Number(stickerPrice) - Number(costPrice)))
                throw JSON.stringify({
                    message: 'margin must be greater than 0 and less than ' + (Number(stickerPrice) - Number(costPrice)),
                    param: 'margin',
                    files: files,
                });
            //Assigning the margin to the product object
            product.margin = margin;
            /************* margin validation ends *************/




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
                            message: 'Directory already exist',
                            param: 'Image Directory',
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

            return res.json({ msg: 'successful' });

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
/**
 * checkRequired function
 * This function check if the field is not null or empty
 * @param {*} field 
 * @returns true - if empty/null, false - not empty/null 
 */
function checkRequired(field) {
    return !field || field.length == 0;
}

/**
 * checkLength function
 * This function check if the field(String) has length greater
 * than min and less than max
 * @param {*} field
 * @param {*} min
 * @param {*} max
 * @returns true - if field is between min and max,
 *          false - if field is not in between min and max 
 */
function checkLength(field, min, max) {

    if (!field)
        return false;
    // trimming the extra space before and after the field
    field = field.trim();
    return field.length >= min && field.length <= max;
}

/**
 * checkValue function
 * This function check if the field(Numeric) is greater than
 * min and less than max 
 * @param {*} field 
 * @param {*} min 
 * @param {*} max 
 * @returns true - if field is between min and max,
 *          false - if field is not in between min and max
 */
function checkValue(field, min, max) {

    if (!field)
        return true;

    try {
        field = Number(field);
        if (isNaN(field))
            return false;
        return field >= min && field <= max;

    } catch (err) {
        return false;
    }
}