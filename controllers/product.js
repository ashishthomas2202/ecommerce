const formidable = require('formidable');
const path = require('path');
const fs = require('fs');
const fsPromises = fs.promises;
const _ = require('lodash');


const Product = require('../models/product');
const { Console } = require('console');
// const { errorHandler } = require('../helpers/dbErrorHandler');

const folderPath = path.join(__dirname, '../public/products/temp')

exports.create = function(req, res) {

    //Initializing the formidable
    let form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.keepExtensions = true;
    //accept multiple files
    form.multiples = true;
    // directory to upload files
    form.uploadDir = folderPath;


    // parsing the form data
    form.parse(req, function(err, fields, files) {

        // if there is any error occurs in parsing form
        if (err) {

            return handleProducterrors(res, 'Image could not be uploaded', 'images', files);
        }


        //***************** Parsing Fields *************************


        let { sku, name, ribbon, categoryId, costPrice, margin, stickerPrice, onSale, discount, description, additionalInfo, productOptions } = fields;


        /******** sku validation ********/
        // sku doesn't exist or isEmpty
        if (checkRequired(sku))
            return handleProducterrors(res, 'sku is required', 'sku', files);

        // sku contains less than 3 characters or  more than 15 characters
        if (!checkLength(sku, 3, 15))
            return handleProducterrors(res, 'sku must be between 3 to 15 characters', 'sku', files);
        /******** sku validation ends ********/






        /************* images validation *************/
        // Folder to save all the images of the product 
        const folderName = _.kebabCase(sku);
        createDir(path.join(__dirname, '../public/products/') + folderName);

        // An array to store multiple images
        let imageList = [];

        //if images doesn't exist
        if (!(files.images && files.images != ''))
            handleProducterrors(res, 'images is required', 'images', files);



        for (let image of files.images) {
            // temporary location of the image
            let oldPath = image.path;
            // index of the dot before the image extension
            let indexOfDot = image.name.indexOf('.');
            // Name of the image
            let name = _.kebabCase(image.name.substring(0, indexOfDot));
            // extension of the image
            let extension = image.name.substring(indexOfDot);


            if (!(extension.toLowerCase() === '.jpg' || extension.toLowerCase() === '.jpeg' || extension.toLowerCase() === '.bmp' || extension.toLowerCase() === '.png' || extension.toLowerCase() === '.gif' || extension.toLowerCase() === '.tiff' || extension.toLowerCase() === '.svg' || extension.toLowerCase() === '.webp')) {
                return handleProducterrors(res, 'Invalid image format', 'images', files);
            }
            // New location of the image
            let newPath = path.join(folderPath, '../', folderName, name + extension);

            imageList.push({
                oldPath,
                name,
                extension,
                folderName,
                newPath,
            });
        }

        try {
            moveImages(imageList);
        } catch (err) {
            return handleProducterrors(res, 'Error Uploading image', 'images', files, folderName);
        }


        let images = [];

        for (let img of imageList) {
            images.push({
                name: img.name,
                extension: img.extension,
                location: img.folderName
            });
        }

        console.log(images);
        /************* images validation ends *************/



        /************* name validation *************/
        // name doesn't exist or isEmpty
        if (checkRequired(name))
            return handleProducterrors(res, 'name is required', 'name', files);

        // name contains less than 3 characters or  more than 60 characters
        if (!checkLength(name, 3, 60))
            return handleProducterrors(res, 'name must be between 3 to 60 characters', 'name', files);
        /************* name validation ends *************/



        /************* ribbon validation *************/
        // ribbon contains less than 3 characters or  more than 60 characters
        if (!checkLength(ribbon, 3, 20))
            return handleProducterrors(res, 'ribbon must be between 3 to 20 characters', 'ribbon', files);
        /************* ribbon validation ends *************/



        /************* categoryId validation *************/
        // categoryId doesn't exist or isEmpty
        if (checkRequired(categoryId))
            return handleProducterrors(res, 'categoryId is required', 'categoryId', files);
        /************* categoryId validation ends *************/



        /************* costPrice validation *************/
        // costPrice doesn't exist or isEmpty
        if (checkRequired(costPrice))
            return handleProducterrors(res, 'costPrice is required', 'costPrice', files);

        // costPrice must be greater than 0 and less than 99999
        if (!checkValue(costPrice, 0.01, 99999))
            return handleProducterrors(res, 'costPrice must be greater than 0.01 and less than 99999', 'costPrice', files);
        /************* costPrice validation ends *************/



        /************* margin validation *************/
        // margin doesn't exist or isEmpty
        if (checkRequired(margin))
            return handleProducterrors(res, 'margin is required', 'margin', files);

        // margin must be greater than 0 and less than 99999
        if (!checkValue(margin, 0.01, 99999))
            return handleProducterrors(res, 'margin must be greater than 0.01 and less than 99999', 'margin', files);
        /************* margin validation ends *************/



        /************* stickerPrice validation *************/
        // stickerPrice doesn't exist or isEmpty
        if (checkRequired(stickerPrice))
            return handleProducterrors(res, 'stickerPrice is required', 'stickerPrice', files);

        // stickerPrice must be greater than 0 and less than 99999
        if (!checkValue(stickerPrice, 0.01, 99999))
            return handleProducterrors(res, 'stickerPrice must be greater than 0.01 and less than 99999', 'stickerPrice', files);
        /************* stickerPrice validation ends *************/



        /************* onSale validation *************/
        if (onSale) {
            // trimming all the space before and after onSale
            onSale = onSale.trim();
            //check if the value is either true or false
            if (!(onSale.toLowerCase() === 'true' || onSale.toLowerCase() === 'false'))
                return handleProducterrors(res, 'onSale must be either true or false', 'onSale', files);
        }
        /************* onSale validation ends *************/



        /************* discount validation *************/
        if (discount) {
            try {
                // parsing data in json format
                discount = JSON.parse(discount);

                // discount.amount doesn't exist or isEmpty
                if (checkRequired(discount.amount))
                    return handleProducterrors(res, 'discount amount is required', 'discount amount', files);
                // discount.amount must be greater than 0 and less than 99999
                if (!checkValue(discount.amount, 0.01, 99999))
                    return handleProducterrors(res, 'discount amount must be greater than 0.01 and less than 99999', 'discount amount', files);

                // discount.symbol doesn't exist or isEmpty
                if (checkRequired(discount.symbol))
                    return handleProducterrors(res, 'discount symbol is required', 'discount symbol', files);
                // discount.symbol contain 1 character only
                if (!checkLength(discount.symbol, 1, 1))
                    return handleProducterrors(res, 'discount symbol must contain only 1 character ( % or $ )', 'discount symbol', files);

                if (!(discount.symbol === '$' || discount.symbol === '%'))
                    return handleProducterrors(res, 'discount symbol must be % or $', 'discount symbol', files);

            } catch (err) {
                return handleProducterrors(res, 'discount format is invalid', 'discount', files);
            }
        }
        /************* discount validation ends *************/



        /************* description validation *************/
        // description doesn't exist or isEmpty
        if (checkRequired(description))
            return handleProducterrors(res, 'description is required', 'description', files);

        // description contains less than 3 characters or  more than 400 characters
        if (!checkLength(description, 3, 400))
            return handleProducterrors(res, 'description must be between 3 to 400 characters', 'description', files);
        /************* description validation ends *************/



        /************* additionalInfo validation *************/
        if (additionalInfo) {
            try {
                //parsing data in json format
                additionalInfo = JSON.parse(additionalInfo);

                // loop to go through each additionalInfo
                for (let info of additionalInfo) {

                    // info.title doesn't exist or isEmpty
                    if (checkRequired(info.title))
                        return handleProducterrors(res, 'title is required', 'title', files);
                    // info.title must be between 3 to 32 characters
                    if (!checkLength(info.title, 3, 32))
                        return handleProducterrors(res, 'title must be between 3 to 32 characters', 'title', files);

                    // info.info doesn't exist or isEmpty
                    if (checkRequired(info.info))
                        return handleProducterrors(res, 'info is required', 'info', files);
                    // info.info must be between 3 to 200 characters
                    if (!checkLength(info.info, 3, 200))
                        return handleProducterrors(res, 'info must be between 3 to 200 characters', 'info', files);
                }
            } catch (err) {
                return handleProducterrors(res, 'discount format is invalid', 'discount', files);
            }
        }
        /************* additionalInfo validation ends *************/



        /************* productOptions validation *************/
        if (productOptions) {
            try {
                //parsing data in json format
                productOptions = JSON.parse(productOptions);

                // loop to go through each productOptions
                for (let option of productOptions) {

                    // option.optionTitle doesn't exist or isEmpty
                    if (checkRequired(option.optionTitle))
                        return handleProducterrors(res, 'optionTitle is required', 'optionTitle', files);
                    // option.optionTitle must be between 3 to 32 characters
                    if (!checkLength(option.optionTitle, 3, 32))
                        return handleProducterrors(res, 'optionTitle must be between 3 to 32 characters', 'optionTitle', files);

                    // option.varients doesn't exist or isEmpty
                    if (checkRequired(option.varients))
                        return handleProducterrors(res, 'varients is required', 'varients', files);

                    //loop to go through each varient
                    for (let varient of option.varients) {

                        // varient.name doesn't exist or isEmpty
                        if (checkRequired(varient.name))
                            return handleProducterrors(res, 'varient name is required', 'varient name', files);
                        // varient.name must be between 3 to 32 characters
                        if (!checkLength(varient.name, 3, 32))
                            return handleProducterrors(res, 'varient name must be between 3 to 32 characters', 'varient name', files);

                        // varient.stock doesn't exist or isEmpty
                        if (checkRequired(varient.stock))
                            return handleProducterrors(res, 'varient stock is required', 'varient stock', files);

                        for (let stock of varient.stock) {

                            // stock.costPrice doesn't exist or isEmpty
                            if (checkRequired(stock.costPrice))
                                return handleProducterrors(res, 'stock costPrice is required', 'stock costPrice', files);
                            // stock.costPrice must be greater than 0 and less than 99999
                            if (!checkValue(stock.costPrice, 0.01, 99999))
                                return handleProducterrors(res, 'stock costPrice must be greater than 0.01 and less than 99999', 'stock costPrice', files);

                            // stock.margin doesn't exist or isEmpty
                            if (checkRequired(stock.margin))
                                return handleProducterrors(res, 'stock margin is required', 'stock margin', files);
                            // stock.margin must be greater than 0 and less than 99999
                            if (!checkValue(stock.margin, 0.01, 99999))
                                return handleProducterrors(res, 'stock margin must be greater than 0.01 and less than 99999', 'stock margin', files);

                            // stock.stickerPrice doesn't exist or isEmpty
                            if (checkRequired(stock.stickerPrice))
                                return handleProducterrors(res, 'stock stickerPrice is required', 'stock stickerPrice', files);
                            // stock.margin must be greater than 0 and less than 99999
                            if (!checkValue(stock.stickerPrice, 0.01, 99999))
                                return handleProducterrors(res, 'stock stickerPrice must be greater than 0.01 and less than 99999', 'stock stickerPrice', files);

                            // stock.quantity doesn't exist or isEmpty
                            if (checkRequired(stock.quantity))
                                return handleProducterrors(res, 'stock quantity is required', 'stock quantity', files);
                            // stock.quantity must be greater than 0 and less than 99999
                            if (!checkValue(stock.quantity, 0.01, 99999))
                                return handleProducterrors(res, 'stock quantity must be greater than 0 and less than 99999', 'stock quantity', files);

                            // stock.weight doesn't exist or isEmpty
                            if (checkRequired(stock.weight))
                                return handleProducterrors(res, 'stock weight is required', 'stock weight', files);

                            // stock.weight.value doesn't exist or isEmpty
                            if (checkRequired(stock.weight.value))
                                return handleProducterrors(res, 'stock weight value is required', 'stock weight value', files);
                            // stock.weight.value must be greater than 0 and less than 99999
                            if (!checkValue(stock.weight.value, 0.01, 99999))
                                return handleProducterrors(res, 'stock weight value must be greater than 0 and less than 99999', 'stock weight value', files);

                            // stock.weight.unit doesn't exist or isEmpty
                            if (checkRequired(stock.weight.unit))
                                return handleProducterrors(res, 'stock weight unit is required', 'stock weight unit', files);
                            // stock.weight.unit must be 2 characters
                            if (!checkLength(stock.weight.unit, 2, 2))
                                return handleProducterrors(res, 'stock weight unit must be 2 characters(kg/lb)', 'stock weight unit', files);
                            // stock.weight.unit must be either kg or lb
                            if (!(stock.weight.unit === 'lb' || stock.weight.unit === 'kg'))
                                return handleProducterrors(res, 'stock weight unit must be kg or lb', 'stock weight unit', files);

                        }


                    }
                }
            } catch (err) {
                return handleProducterrors(res, 'productOptions format is invalid', 'productOptions', files);
            }
        }
        /************* productOptions validation ends *************/









        return res.json({ msg: "success" });



    });
}


function moveImages(images) {

    for (let image of images) {
        if (fs.existsSync(image.oldPath)) {
            fs.rename(image.oldPath, image.newPath, function(err) {
                if (err)
                    throw "Image rename Unsuccessful"
                        // else
                        //     console.log('rename successful');
            });
        } else {
            throw "Image doesn\'t exist";
        }
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



/**
 * handleProducterrors function
 * This function will delete the images and send response
 * appropriately
 * @param {*} res 
 * @param {*} msg 
 * @param {*} param 
 * @param {*} files 
 */
function handleProducterrors(res, msg, param, files, folder) {


    deleteTempImages(files);
    if (folder)
        removeDir(folder);

    res.status(400).json({
        "errors": [{
            "msg": msg,
            "param": param
        }]
    });
}



/**
 * deleteTempImages function
 * This function will delete the images from the 
 * temporary location
 * @param {*} files 
 */
async function deleteTempImages(files) {

    // check if the image is present or not
    if (files.images && files.images != '') {

        // loop to go through every image
        for (let image of files.images) {

            // try to remove the image from temporary location 
            try {
                //removing the file
                await fs.unlinkSync(image.path);

            } catch (err) {
                console.log(err);
            }
        }
    }
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

    directoryPath = path.join(folderPath, '../', directoryPath);
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