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


        let { sku, name } = fields;

        /******** SKU validation ********/
        // SKU doesn't exist or isEmpty
        if (checkRequired(sku))
            return handleProducterrors(res, 'SKU is required', 'SKU', files);

        // SKU contains less than 3 characters or  more than 15 characters
        if (checkLength(sku, 3, 15))
            return handleProducterrors(res, 'SKU must be between 3 to 15 characters', 'SKU', files);

        /******** SKU validation ends ********/



        /************* name validation *************/
        // name doesn't exist or isEmpty
        if (checkRequired(name))
            return handleProducterrors(res, 'name is required', 'name', files);

        // name contains less than 3 characters or  more than 60 characters
        if (checkLength(name, 3, 60))
            return handleProducterrors(res, 'name must be between 3 to 60 characters', 'name', files);

        /************* name validation ends *************/


        return res.json({ msg: "success" });
    });

}

function checkRequired(field) {
    return !field || field.length == 0;
}

function checkLength(field, min, max) {

    // trimming the extra space before and after the field
    field = field.trim();
    return field.length < min || field.length > max;
}

function handleProducterrors(res, msg, param, files) {

    deleteTempImages(files);

    res.status(400).json({
        "errors": [{
            "msg": msg,
            "param": param
        }]
    });
}

function deleteTempImages(files) {
    // files are uploaded which needs to be deleted because of error
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