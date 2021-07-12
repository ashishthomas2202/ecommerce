const formidable = require('formidable');
const path = require('path');
const fs = require('fs');


const Product = require('../models/product');
// const { errorHandler } = require('../helpers/dbErrorHandler');

exports.create = function(req, res) {

    //Initializing the formidable
    let form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.keepExtensions = true;
    //accept multiple files
    form.multiples = true;
    // directory to upload files
    form.uploadDir = path.join(__dirname, '../public/products');


    // parsing the form data
    form.parse(req, function(err, fields, files) {

        // if there is any error occurs in parsing form
        if (err) {

            deleteTempImages(files);

            return res.status(400).json({
                "errors": [{
                    "msg": "Image could not be uploaded",
                    "param": "images"
                }]
            });
        }


        //***************** Parsing Fields *************************


        let { sku, name, ribbon, categoryId, costPrice, margin, stickerPrice, onSale, discount, description } = fields;



        /******** sku validation ********/
        // sku doesn't exist or isEmpty
        if (checkRequired(sku))
            return handleProducterrors(res, 'sku is required', 'sku', files);

        // sku contains less than 3 characters or  more than 15 characters
        if (!checkLength(sku, 3, 15))
            return handleProducterrors(res, 'sku must be between 3 to 15 characters', 'sku', files);
        /******** sku validation ends ********/



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


        return res.json({ msg: "success" });
    });
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
function handleProducterrors(res, msg, param, files) {

    deleteTempImages(files);

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
function deleteTempImages(files) {

    // check if the image is present or not
    if (files.images && files.images != '') {

        // loop to go through every image
        for (image of files.images) {

            // try to remove the image from temporary location 
            try {
                //removing the file
                fs.unlinkSync(image.path);

            } catch (err) {
                console.log(err);
            }
        }
    }
}