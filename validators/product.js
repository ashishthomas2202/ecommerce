exports.check = function(option, data) {
    switch (option) {
        case 'sku':
            // sku doesn't exist or isEmpty
            if (checkRequired(data.sku))
                throw JSON.stringify({
                    message: 'sku is required',
                    param: 'sku',
                    files: data.files,
                });
            // sku contains less than 3 characters or  more than 15 characters
            if (!checkLength(data.sku, 3, 15))
                throw JSON.stringify({
                    message: 'sku must be between 3 to 15 characters',
                    param: 'sku',
                    files: data.files
                });
            break;

        case 'name':
            // name doesn't exist or isEmpty
            if (checkRequired(data.name))
                throw JSON.stringify({
                    message: 'name is required',
                    param: 'name',
                    files: data.files,
                });
            // name contains less than 3 characters or  more than 60 characters
            if (!checkLength(data.name, 3, 60))
                throw JSON.stringify({
                    message: 'name must be between 3 to 60 characters',
                    param: 'name',
                    files: data.files,
                });
            break;

        case 'ribbon':
            // ribbon contains less than 3 characters or  more than 60 characters
            if (!checkLength(data.ribbon, 3, 20))
                throw JSON.stringify({
                    message: 'ribbon must be between 3 to 20 characters',
                    param: 'ribbon',
                    files: data.files,
                });
            break;

        case 'categoryId':
            // categoryId doesn't exist or isEmpty
            if (checkRequired(data.categoryId)) {
                throw JSON.stringify({
                    message: 'categoryId is required',
                    param: 'categoryId',
                    files: data.files,
                });
            }

            // flags to check if found
            let otherCategoryFound = false;
            let allProductCategoryFound = false;


            // loop to go through each category 
            for (let category of data.categoryId) {
                //category is All Products 
                if ((String(category) === String(data.allProductCategoryId)))
                    allProductCategoryFound = true;
                //category is not All Products 
                else
                    otherCategoryFound = true;
            }

            // category other than All Products not found
            if (!otherCategoryFound) {
                throw JSON.stringify({
                    message: 'categoryId is required other than All Products',
                    param: 'categoryId',
                    files: data.files,
                });
            }

            // All products categoryId is not in the list 
            if (!allProductCategoryFound) {
                // Adding "All Products" category in the list
                data.categoryId.push(data.allProductCategoryId);
            }
            break;

        case 'sold':
            // sold is not number
            if (data.sold && !((typeof data.sold) == "number"))
                throw JSON.stringify({
                    message: 'sold must be a number',
                    param: 'sold',
                    files: data.files,
                });

            break;

        case 'onePrice':
            // onePrice doesn't exist or isEmpty
            if (!((typeof data.onePrice) == "boolean"))
                throw JSON.stringify({
                    message: 'onePrice is required',
                    param: 'onePrice',
                    files: data.files,
                });
            // check if onePrice is either true or false
            if (!(data.onePrice == true || data.onePrice == false))
                throw JSON.stringify({
                    message: 'onePrice must be either true or false',
                    param: 'onePrice',
                    files: data.files,
                });
            break;

        case 'costPrice':
            // costPrice doesn't exist or isEmpty
            if (checkRequired(data.costPrice))
                throw JSON.stringify({
                    message: 'costPrice is required',
                    param: 'costPrice',
                    files: data.files,
                });
            // costPrice must be greater than 0 and less than 99999
            if (!checkValue(data.costPrice, 0.01, 99999))
                throw JSON.stringify({
                    message: 'costPrice must be greater than 0.01 and less than 99999',
                    param: 'costPrice',
                    files: data.files,
                });
            break;

        case 'stickerPrice':
            // stickerPrice doesn't exist or isEmpty
            if (checkRequired(data.stickerPrice))
                throw JSON.stringify({
                    message: 'stickerPrice is required',
                    param: 'stickerPrice',
                    files: data.files,
                });
            // stickerPrice must be greater than costPrice and less than 99999
            if (!checkValue(data.stickerPrice, Number(data.costPrice) + 0.01, 99999))
                throw JSON.stringify({
                    message: 'stickerPrice must be greater than ' + data.costPrice + ' and less than 99999',
                    param: 'stickerPrice',
                    files: data.files,
                });
            break;

        case 'margin':
            // margin doesn't exist or isEmpty
            if (checkRequired(data.margin))
                throw JSON.stringify({
                    message: 'margin is required',
                    param: 'margin',
                    files: data.files,
                });
            // margin must be greater than 0 and less than stickerPrice - cost price
            if (!checkValue(data.margin, 0.01, Number(data.stickerPrice) - Number(data.costPrice)))
                throw JSON.stringify({
                    message: 'margin must be greater than 0 and less than ' + (Number(data.stickerPrice) - Number(data.costPrice)),
                    param: 'margin',
                    files: data.files,
                });
            break;

        case 'onSale':
            // onSale doesn't exist or isEmpty
            if (!((typeof data.onSale) == "boolean"))
                throw JSON.stringify({
                    message: 'onSale is required',
                    param: 'onSale',
                    files: data.files,
                });
            // check if onSale is either true or false
            if (!(data.onSale == true || data.onSale == false))
                throw JSON.stringify({
                    message: 'onSale must be either true or false',
                    param: 'onSale',
                    files: data.files,
                });
            break;

        case 'discount':
            // discount doesn't exist or isEmpty
            if (checkRequired(data.discount))
                throw JSON.stringify({
                    message: 'discount is required',
                    param: 'discount',
                    files: data.files,
                });
            // discount amount doesn't exist or isEmpty
            if (checkRequired(data.discount.amount))
                throw JSON.stringify({
                    message: 'discount amount is required',
                    param: 'discount amount',
                    files: data.files,
                });
            // discount symbol doesn't exist or isEmpty
            if (checkRequired(data.discount.symbol))
                throw JSON.stringify({
                    message: 'discount symbol is required',
                    param: 'discount symbol',
                    files: data.files,
                });
            // discount symbol must be either '%' or '$'
            if (!(data.discount.symbol == '%' || data.discount.symbol == '$'))
                throw JSON.stringify({
                    message: 'discount symbol must be either % or $',
                    param: 'discount symbol',
                    files: data.files,
                });
            // checking the discount amount for percentage
            if (data.discount.symbol == '%') {
                if (!checkValue(data.discount.amount, 0.01, 100))
                    throw JSON.stringify({
                        message: 'discount amount must be greater than 0 and less than 100 %',
                        param: 'discount amount',
                        files: data.files,
                    });
            }
            // checking the discount amount for dollar
            if (data.discount.symbol == '$') {
                if (!checkValue(data.discount.amount, 0.01, 99999))
                    throw JSON.stringify({
                        message: 'discount amount must be greater than 0 and less than 99999 $',
                        param: 'discount amount',
                        files: data.files,
                    });
            }
            break;

        case 'description':
            // description doesn't exist or isEmpty
            if (checkRequired(data.description))
                throw JSON.stringify({
                    message: 'description is required',
                    param: 'description',
                    files: data.files,
                });
            // description contains less than 3 characters or  more than 400 characters
            if (!checkLength(data.description, 3, 400))
                throw JSON.stringify({
                    message: 'description must be between 3 to 400 characters',
                    param: 'description',
                    files: data.files,
                });
            break;

        case 'additionalInfo':
            // loop to go through each additionalInfo
            for (let info of data.additionalInfo) {
                // info.title doesn't exist or isEmpty
                if (checkRequired(info.title))
                    throw JSON.stringify({
                        message: 'title is required',
                        param: 'additionalInfo',
                        files: data.files,
                    });
                // info.title must be between 3 to 32 characters
                if (!checkLength(info.title, 3, 32))
                    throw JSON.stringify({
                        message: 'title must be between 3 to 32 characters',
                        param: 'additionalInfo',
                        files: data.files,
                    });
                // info.info doesn't exist or isEmpty
                if (checkRequired(info.info))
                    throw JSON.stringify({
                        message: 'info is required',
                        param: 'additionalInfo',
                        files: data.files,
                    });
                // info.info must be between 3 to 200 characters
                if (!checkLength(info.info, 3, 200))
                    throw JSON.stringify({
                        message: 'info must be between 3 to 200 characters',
                        param: 'additionalInfo',
                        files: data.files,
                    });
            }
            break;

        case 'productOptions':
            // loop to go through each productOptions
            for (let option of data.productOptions) {
                // option.optionTitle doesn't exist or isEmpty
                if (checkRequired(option.optionTitle))
                    throw JSON.stringify({
                        message: 'option title is required',
                        param: 'productOptions',
                        files: data.files,
                    });
                // option.optionTitle must be between 3 to 32 characters
                if (!checkLength(option.optionTitle, 3, 32))
                    throw JSON.stringify({
                        message: 'option title must be between 3 to 32 characters',
                        param: 'productOptions',
                        files: data.files,
                    });
                // option.varients doesn't exist or isEmpty
                if (checkRequired(option.varients))
                    throw JSON.stringify({
                        message: 'varients is required',
                        param: 'productOptions',
                        files: data.files,
                    });
                //loop to go through each varient
                for (let varient of option.varients) {
                    // varient.name doesn't exist or isEmpty
                    if (checkRequired(varient.name))
                        throw JSON.stringify({
                            message: 'varient name is required',
                            param: 'productOptions',
                            files: data.files,
                        });
                    // varient.name must be between 3 to 32 characters
                    if (!checkLength(varient.name, 3, 32))
                        throw JSON.stringify({
                            message: 'varient name must be between 3 to 32 characters',
                            param: 'productOptions',
                            files: data.files,
                        });

                    // varient.stock doesn't exist or isEmpty
                    if (checkRequired(varient.stock))
                        throw JSON.stringify({
                            message: 'varient stock is required',
                            param: 'productOptions',
                            files: data.files,
                        });

                    // loop to go through each stock 
                    for (let stock of varient.stock) {

                        if (!data.onePrice) {
                            // costPrice doesn't exist or isEmpty
                            if (checkRequired(stock.costPrice))
                                throw JSON.stringify({
                                    message: 'costPrice is required',
                                    param: 'productOptions',
                                    files: data.files,
                                });
                            // costPrice must be greater than 0 and less than 99999
                            if (!checkValue(stock.costPrice, 0.01, 99999))
                                throw JSON.stringify({
                                    message: 'costPrice must be greater than 0.01 and less than 99999',
                                    param: 'productOptions',
                                    files: data.files,
                                });

                            // stickerPrice doesn't exist or isEmpty
                            if (checkRequired(stock.stickerPrice))
                                throw JSON.stringify({
                                    message: 'stickerPrice is required',
                                    param: 'productOptions',
                                    files: data.files,
                                });
                            // stickerPrice must be greater than costPrice and less than 99999
                            if (!checkValue(stock.stickerPrice, Number(stock.costPrice) + 0.01, 99999))
                                throw JSON.stringify({
                                    message: 'stickerPrice must be greater than ' + stock.costPrice + ' and less than 99999',
                                    param: 'productOptions',
                                    files: data.files,
                                });

                            // margin doesn't exist or isEmpty
                            if (checkRequired(stock.margin))
                                throw JSON.stringify({
                                    message: 'margin is required',
                                    param: 'productOptions',
                                    files: data.files,
                                });
                            // margin must be greater than 0 and less than stickerPrice - cost price
                            if (!checkValue(stock.margin, 0.01, Number(stock.stickerPrice) - Number(stock.costPrice)))
                                throw JSON.stringify({
                                    message: 'margin must be greater than 0 and less than ' + (Number(stock.stickerPrice) - Number(stock.costPrice)),
                                    param: 'productOptions',
                                    files: data.files,
                                });
                        } else {
                            stock.costPrice = data.costPrice;
                            stock.stickerPrice = data.stickerPrice;
                            stock.margin = data.margin;
                        }
                        // stock.quantity doesn't exist or isEmpty
                        if (checkRequired(stock.quantity))
                            throw JSON.stringify({
                                message: 'stock quantity is required',
                                param: 'productOptions',
                                files: data.files,
                            });
                        // stock.quantity must be greater than 0 and less than 99999
                        if (!checkValue(stock.quantity, 0.01, 99999))
                            throw JSON.stringify({
                                message: 'stock quantity must be greater than 0 and less than 99999',
                                param: 'productOptions',
                                files: data.files,
                            });
                        // stock.weight doesn't exist or isEmpty
                        if (checkRequired(stock.weight))
                            throw JSON.stringify({
                                message: 'stock weight is required',
                                param: 'productOptions',
                                files: data.files,
                            });
                        // stock.weight.value doesn't exist or isEmpty
                        if (checkRequired(stock.weight.value))
                            throw JSON.stringify({
                                message: 'stock weight value is required',
                                param: 'productOptions',
                                files: data.files,
                            });
                        // stock.weight.value must be greater than 0 and less than 99999
                        if (!checkValue(stock.weight.value, 0.01, 99999))
                            throw JSON.stringify({
                                message: 'stock weight value must be greater than 0 and less than 99999',
                                param: 'productOptions',
                                files: data.files,
                            });
                        // stock.weight.unit doesn't exist or isEmpty
                        if (checkRequired(stock.weight.unit))
                            throw JSON.stringify({
                                message: 'stock weight unit is required',
                                param: 'productOptions',
                                files: data.files,
                            });
                        // stock.weight.unit must be 2 characters
                        if (!checkLength(stock.weight.unit, 2, 2))
                            throw JSON.stringify({
                                message: 'stock weight unit must be 2 characters(kg/lb)',
                                param: 'productOptions',
                                files: data.files,
                            });
                        // stock.weight.unit must be either kg or lb
                        if (!(stock.weight.unit === 'lb' || stock.weight.unit === 'kg'))
                            throw JSON.stringify({
                                message: 'stock weight unit must be kg or lb',
                                param: 'productOptions',
                                files: data.files,
                            });
                    }
                }
            }
            break;
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