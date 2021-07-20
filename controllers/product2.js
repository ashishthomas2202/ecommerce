const formidable = require('formidable');
const path = require('path');
// const fs = require('fs');
// const fsPromises = fs.promises;
const { access, mkdir, rename, stat } = require('fs/promises');
const { constants } = require('fs');
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

            return handleProducterrors(res, 'Image could not be uploaded', 'images');
        }


        //***************** Parsing Fields *************************


        let { sku, name, ribbon, categoryId, costPrice, margin, stickerPrice, onSale, discount, description, additionalInfo, productOptions } = fields;

        try {
            /******** sku validation ********/
            // sku doesn't exist or isEmpty
            if (checkRequired(sku))
                return handleProducterrors(res, 'sku is required', 'sku');

            // sku contains less than 3 characters or  more than 15 characters
            if (!checkLength(sku, 3, 15))
                return handleProducterrors(res, 'sku must be between 3 to 15 characters', 'sku');
            /******** sku validation ends ********/



            /************* images validation *************/
            // Folder to save all the images of the product 
            const folderName = _.kebabCase(sku);

            // const directoryPath = path.join(__dirname, '../public/products', folderName);

            createDir(path.join(__dirname, '../public/products', folderName)).catch((err) => {
                // if (err) {
                //     // console.log(err);
                throw { message: err.message, param: 'image folder' };
                // .json({
                //     "errors": [{
                //         "msg": err.message,
                //         "param": 'image folder'
                //     }]
                // });
                // 
                // }
            });
            // let createDir = async function(directoryPath) {
            //     try {
            //         await access(directoryPath, constants.R_OK | constants.W_OK);
            //         return 'Directory already exists';

            //     } catch {
            //         try {
            //             await mkdir(directoryPath);
            //         } catch (err) {
            //             throw err;
            //         }
            //     }
            // };

            // const directoryPath = path.join(__dirname, '../public/products', folderName);
            // result(directoryPath).then(function(message) {
            //         console.log(message);
            //         return handleProducterrors(res, 'Directory already exist', 'images folder', folderName);
            //     })
            // An array to store multiple images
            let imageList = [];

            //if images doesn't exist
            if (!(files.images && files.images != ''))
                handleProducterrors(res, 'images is required', 'images', folderName);

            //loop to go through every image 
            for (let image of files.images) {

                // temporary location of the image
                let oldPath = image.path;
                // index of the dot before the image extension
                let indexOfDot = image.name.indexOf('.');
                // Name of the image
                let name = _.kebabCase(image.name.substring(0, indexOfDot));
                // extension of the image
                let extension = image.name.substring(indexOfDot);

                // checking for the file extension
                if (!(extension.toLowerCase() === '.jpg' || extension.toLowerCase() === '.jpeg' || extension.toLowerCase() === '.bmp' || extension.toLowerCase() === '.png' || extension.toLowerCase() === '.gif' || extension.toLowerCase() === '.tiff' || extension.toLowerCase() === '.svg' || extension.toLowerCase() === '.webp')) {
                    return handleProducterrors(res, 'Invalid image format', 'images', folderName);
                }
                // New location of the image
                let newPath = path.join(folderPath, '../', folderName, name + extension);

                // adding images info in an array
                imageList.push({
                    oldPath,
                    name,
                    extension,
                    folderName,
                    newPath,
                });
            }

            // moving the images from temp folder to its own product folder
            try {
                moveImages(imageList);
            } catch (err) {
                return handleProducterrors(res, 'Error Uploading image', 'images', folderName);
            }


            let images = [];

            for (let img of imageList) {
                images.push({
                    name: img.name,
                    extension: img.extension,
                    location: img.folderName,
                    path: img.newPath
                });
            }

            // console.log(images);
            /************* images validation ends *************/



            /************* name validation *************/
            // name doesn't exist or isEmpty
            if (checkRequired(name))
            // return handleProducterrors(res, 'name is required', 'name', folderName);
                throw { message: 'name is required', param: 'name' }


            // name contains less than 3 characters or  more than 60 characters
            if (!checkLength(name, 3, 60))
            // return handleProducterrors(res, 'name must be between 3 to 60 characters', 'name', folderName);
                throw { message: 'name must be between 3 to 60 characters', param: 'name' }

            /************* name validation ends *************/



            /************* ribbon validation *************/
            // ribbon contains less than 3 characters or  more than 60 characters
            if (!checkLength(ribbon, 3, 20))
                return handleProducterrors(res, 'ribbon must be between 3 to 20 characters', 'ribbon', folderName);
            /************* ribbon validation ends *************/



            /************* categoryId validation *************/
            // categoryId doesn't exist or isEmpty
            if (checkRequired(categoryId))
                return handleProducterrors(res, 'categoryId is required', 'categoryId', folderName);
            /************* categoryId validation ends *************/



            /************* costPrice validation *************/
            // costPrice doesn't exist or isEmpty
            if (checkRequired(costPrice))
                return handleProducterrors(res, 'costPrice is required', 'costPrice', folderName);

            // costPrice must be greater than 0 and less than 99999
            if (!checkValue(costPrice, 0.01, 99999))
                return handleProducterrors(res, 'costPrice must be greater than 0.01 and less than 99999', 'costPrice', folderName);
            /************* costPrice validation ends *************/



            /************* margin validation *************/
            // margin doesn't exist or isEmpty
            if (checkRequired(margin))
                return handleProducterrors(res, 'margin is required', 'margin', folderName);

            // margin must be greater than 0 and less than 99999
            if (!checkValue(margin, 0.01, 99999))
                return handleProducterrors(res, 'margin must be greater than 0.01 and less than 99999', 'margin', folderName);
            /************* margin validation ends *************/



            /************* stickerPrice validation *************/
            // stickerPrice doesn't exist or isEmpty
            if (checkRequired(stickerPrice))
                return handleProducterrors(res, 'stickerPrice is required', 'stickerPrice', folderName);

            // stickerPrice must be greater than 0 and less than 99999
            if (!checkValue(stickerPrice, 0.01, 99999))
                return handleProducterrors(res, 'stickerPrice must be greater than 0.01 and less than 99999', 'stickerPrice', folderName);
            /************* stickerPrice validation ends *************/



            /************* onSale validation *************/
            if (onSale) {
                // trimming all the space before and after onSale
                onSale = onSale.trim();
                //check if the value is either true or false
                if (!(onSale.toLowerCase() === 'true' || onSale.toLowerCase() === 'false'))
                    return handleProducterrors(res, 'onSale must be either true or false', 'onSale', folderName);
            }
            /************* onSale validation ends *************/



            /************* discount validation *************/
            if (discount) {
                try {
                    // parsing data in json format
                    discount = JSON.parse(discount);

                    // discount.amount doesn't exist or isEmpty
                    if (checkRequired(discount.amount))
                        return handleProducterrors(res, 'discount amount is required', 'discount amount', folderName);
                    // discount.amount must be greater than 0 and less than 99999
                    if (!checkValue(discount.amount, 0.01, 99999))
                        return handleProducterrors(res, 'discount amount must be greater than 0.01 and less than 99999', 'discount amount', folderName);

                    // discount.symbol doesn't exist or isEmpty
                    if (checkRequired(discount.symbol))
                        return handleProducterrors(res, 'discount symbol is required', 'discount symbol', folderName);
                    // discount.symbol contain 1 character only
                    if (!checkLength(discount.symbol, 1, 1))
                        return handleProducterrors(res, 'discount symbol must contain only 1 character ( % or $ )', 'discount symbol', folderName);

                    if (!(discount.symbol === '$' || discount.symbol === '%'))
                        return handleProducterrors(res, 'discount symbol must be % or $', 'discount symbol', folderName);

                } catch (err) {
                    return handleProducterrors(res, 'discount format is invalid', 'discount', folderName);
                }
            }
            /************* discount validation ends *************/



            /************* description validation *************/
            // description doesn't exist or isEmpty
            if (checkRequired(description))
                return handleProducterrors(res, 'description is required', 'description', folderName);

            // description contains less than 3 characters or  more than 400 characters
            if (!checkLength(description, 3, 400))
                return handleProducterrors(res, 'description must be between 3 to 400 characters', 'description', folderName);
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
                            return handleProducterrors(res, 'title is required', 'title', folderName);
                        // info.title must be between 3 to 32 characters
                        if (!checkLength(info.title, 3, 32))
                            return handleProducterrors(res, 'title must be between 3 to 32 characters', 'title', folderName);

                        // info.info doesn't exist or isEmpty
                        if (checkRequired(info.info))
                            return handleProducterrors(res, 'info is required', 'info', folderName);
                        // info.info must be between 3 to 200 characters
                        if (!checkLength(info.info, 3, 200))
                            return handleProducterrors(res, 'info must be between 3 to 200 characters', 'info', folderName);
                    }
                } catch (err) {
                    return handleProducterrors(res, 'discount format is invalid', 'discount', folderName);
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
                            return handleProducterrors(res, 'optionTitle is required', 'optionTitle', folderName);
                        // option.optionTitle must be between 3 to 32 characters
                        if (!checkLength(option.optionTitle, 3, 32))
                            return handleProducterrors(res, 'optionTitle must be between 3 to 32 characters', 'optionTitle', folderName);

                        // option.varients doesn't exist or isEmpty
                        if (checkRequired(option.varients))
                            return handleProducterrors(res, 'varients is required', 'varients', folderName);

                        //loop to go through each varient
                        for (let varient of option.varients) {

                            // varient.name doesn't exist or isEmpty
                            if (checkRequired(varient.name))
                                return handleProducterrors(res, 'varient name is required', 'varient name', folderName);
                            // varient.name must be between 3 to 32 characters
                            if (!checkLength(varient.name, 3, 32))
                                return handleProducterrors(res, 'varient name must be between 3 to 32 characters', 'varient name', folderName);

                            // varient.stock doesn't exist or isEmpty
                            if (checkRequired(varient.stock))
                                return handleProducterrors(res, 'varient stock is required', 'varient stock', folderName);

                            for (let stock of varient.stock) {

                                // stock.costPrice doesn't exist or isEmpty
                                if (checkRequired(stock.costPrice))
                                    return handleProducterrors(res, 'stock costPrice is required', 'stock costPrice', folderName);
                                // stock.costPrice must be greater than 0 and less than 99999
                                if (!checkValue(stock.costPrice, 0.01, 99999))
                                    return handleProducterrors(res, 'stock costPrice must be greater than 0.01 and less than 99999', 'stock costPrice', folderName);

                                // stock.margin doesn't exist or isEmpty
                                if (checkRequired(stock.margin))
                                    return handleProducterrors(res, 'stock margin is required', 'stock margin', folderName);
                                // stock.margin must be greater than 0 and less than 99999
                                if (!checkValue(stock.margin, 0.01, 99999))
                                    return handleProducterrors(res, 'stock margin must be greater than 0.01 and less than 99999', 'stock margin', folderName);

                                // stock.stickerPrice doesn't exist or isEmpty
                                if (checkRequired(stock.stickerPrice))
                                    return handleProducterrors(res, 'stock stickerPrice is required', 'stock stickerPrice', folderName);
                                // stock.margin must be greater than 0 and less than 99999
                                if (!checkValue(stock.stickerPrice, 0.01, 99999))
                                    return handleProducterrors(res, 'stock stickerPrice must be greater than 0.01 and less than 99999', 'stock stickerPrice', folderName);

                                // stock.quantity doesn't exist or isEmpty
                                if (checkRequired(stock.quantity))
                                    return handleProducterrors(res, 'stock quantity is required', 'stock quantity', folderName);
                                // stock.quantity must be greater than 0 and less than 99999
                                if (!checkValue(stock.quantity, 0.01, 99999))
                                    return handleProducterrors(res, 'stock quantity must be greater than 0 and less than 99999', 'stock quantity', folderName);

                                // stock.weight doesn't exist or isEmpty
                                if (checkRequired(stock.weight))
                                    return handleProducterrors(res, 'stock weight is required', 'stock weight', folderName);

                                // stock.weight.value doesn't exist or isEmpty
                                if (checkRequired(stock.weight.value))
                                    return handleProducterrors(res, 'stock weight value is required', 'stock weight value', folderName);
                                // stock.weight.value must be greater than 0 and less than 99999
                                if (!checkValue(stock.weight.value, 0.01, 99999))
                                    return handleProducterrors(res, 'stock weight value must be greater than 0 and less than 99999', 'stock weight value', folderName);

                                // stock.weight.unit doesn't exist or isEmpty
                                if (checkRequired(stock.weight.unit))
                                    return handleProducterrors(res, 'stock weight unit is required', 'stock weight unit', folderName);
                                // stock.weight.unit must be 2 characters
                                if (!checkLength(stock.weight.unit, 2, 2))
                                    return handleProducterrors(res, 'stock weight unit must be 2 characters(kg/lb)', 'stock weight unit', folderName);
                                // stock.weight.unit must be either kg or lb
                                if (!(stock.weight.unit === 'lb' || stock.weight.unit === 'kg'))
                                    return handleProducterrors(res, 'stock weight unit must be kg or lb', 'stock weight unit', folderName);

                            }


                        }
                    }
                } catch (err) {
                    return handleProducterrors(res, 'productOptions format is invalid', 'productOptions', folderName);
                }
            }
            /************* productOptions validation ends *************/



            return res.json({ msg: "success" });
        } catch (err) {
            return handleProducterrors(res, err.message, err.param);
        }


    });
}


async function moveImages(images) {


    for (let image of images) {
        try {
            await stat(image.oldPath);
            try {
                await rename(image.oldPath, image.newPath);
            } catch {
                console.error('Image move unsuccessful');
            }

        } catch {
            console.error('Image path is invalid');
        }
    }



    // try {
    //     for (let image of images) {
    //         if (fsPromises.stat(image.oldPath)) {
    //             if (fsPromises.rename(image.oldPath, image.newPath))
    //                 console.log('rename done');
    //             else
    //                 console.log('rename not donw');
    //         } else {
    //             console.log('doesnt exist');
    //         }
    //     }
    // } catch (err) {
    //     console.error(err);
    // }

    // for (let image of images) {
    //     if (fs.existsSync(image.oldPath)) {
    //         fs.rename(image.oldPath, image.newPath, function(err) {
    //             if (err)
    //                 console.error("Image rename Unsuccessful");
    //             // else
    //             //     console.log('rename successful');
    //         });
    //     } else {
    //         console.error("Image doesn\'t exist");
    //     }
    // }
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



// /**
//  * handleProducterrors function
//  * This function will delete the images and send response
//  * appropriately
//  * @param {*} res 
//  * @param {*} msg 
//  * @param {*} param 
//  * @param {*} files 
//  */
// function handleProducterrors(res, msg, param, files) {


//     deleteTempImages(files);

//     res.status(400).json({
//         "errors": [{
//             "msg": msg,
//             "param": param
//         }]
//     });
// }



/**
 * handleProducterrors function
 * This function will delete the images and send response
 * appropriately
 * @param {*} res 
 * @param {*} msg 
 * @param {*} param 
 * @param {*} files 
 */
function handleProducterrors(res, msg, param, folderName) {

    // removefiles(folderPath);

    // if (folderName)
    //     removeDir(folderName);

    res.status(400).json({
        "errors": [{
            "msg": msg,
            "param": param
        }]
    });
}


function removefiles(dir) {

    // if (fsPromises.stat(dir)) {
    //     console.log('exists');
    //     fsPromises.readdir(dir, (err, files) => {
    //         files.forEach(file => {
    //             try {
    //                 //removing the file
    //                 fsPromises.unlink(path.join(dir, file), function(err) {
    //                     if (err) {
    //                         console.log(err)
    //                     }
    //                 });

    //             } catch (err) {
    //                 console.log(err);
    //             }
    //         });
    //     });

    // } else {
    //     console.error(' doesnt exists');

    // }
}

/**
 * deleteTempImages function
 * This function will delete the images from the 
 * temporary location
 * @param {*} files 
 */
function deleteTempImages(files) {

    // // check if the image is present or not
    // if (files.images && files.images != '') {

    //     // loop to go through every image
    //     for (let image of files.images) {

    //         // try to remove the image from temporary location 
    //         try {
    //             //removing the file
    //             fs.unlinkSync(image.path);


    //         } catch (err) {
    //             console.log(err);
    //         }
    //     }
    // }
}

// This method will create the directory
// @param: String with the folder name starting from root
async function createDir(directoryPath) {

    try {
        await access(directoryPath, constants.R_OK | constants.W_OK);
        return Error('Directory already exists');

    } catch {
        try {
            await mkdir(directoryPath);
        } catch (err) {
            console.log('hi');
        }
    }
}

// This method will remove the directory
// @param: String with the folder name starting from root
function removeDir(dirname) {

    directoryPath = path.join(folderPath, '../', dirname);

    // removefiles(directoryPath);
    // if (fs.existsSync(directoryPath)) {
    //     console.log('exists');
    //     fs.readdir(directoryPath, (err, files) => {
    //         files.forEach(async file => {
    //             try {
    //                 //removing the file
    //                 await fs.unlinkSync(path.join(directoryPath, file));

    //             } catch (err) {
    //                 console.log(err);
    //             }
    //         });
    //     });

    // } else {
    //     console.log('exists');

    // }
    // if (fs.existsSync(directoryPath)) {
    //     console.log("exists");
    //     fs.readdirSync(directoryPath).forEach((file, index) => {
    //         const curPath = path.join(directoryPath, file);

    //         if (fs.lstatSync(curPath).isDirectory()) {
    //             // recurse
    //             console.log(curPath);

    //             deleteFolderRecursive(curPath);
    //         } else {
    //             console.log(curPath);
    //             // delete file
    //             fs.unlinkSync(curPath);
    //         }
    //     });
    // try {
    //     fsPromises.rmdir(directoryPath, (err) => {
    //         if (err)
    //             console.log('Error in deleting directory', err);
    //     });
    // } catch (err) {
    //     console.log(err);
    // }
    // }
}