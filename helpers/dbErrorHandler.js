"use strict";

/**
 * Get unique error field name
 */
const uniqueOutput = error => {
    let output = {};
    try {
        let fieldName = error.message.substring(
            error.message.lastIndexOf("index: ") + 7,
            error.message.lastIndexOf("_1")
        );
        let value = error.message.substring(
            error.message.lastIndexOf("{ " + fieldName) + fieldName.length + 5,
            error.message.lastIndexOf("\"")
        );

        output["msg"] =
            fieldName.charAt(0).toUpperCase() +
            fieldName.slice(1) +
            " already exists";

        output["value"] = value;
        output["param"] = fieldName;


    } catch (ex) {
        output["msg"] = "Unique field already exists";
    }

    return output;
};

/**
 * Get the erroror message from error object
 */
exports.errorHandler = error => {
    let output = [];
    let err = {};
    if (error.code) {
        switch (error.code) {
            case 11000:
            case 11001:
                err = uniqueOutput(error);
                break;
            default:
                err["msg"] = "Something went wrong";
        }
        output.push(err);

    } else if (error.errors) {
        for (let errorName in error.errors) {
            if (error.errors[errorName].kind == 'unique') {
                err["msg"] = error.errors[errorName].path + " must be unique";
                err["param"] = error.errors[errorName].path;
                output.push(err);
                err = {};
            }
        }
    } else {
        for (let errorName in error.errorors) {
            if (error.errorors[errorName].message) {
                err["msg"] = error.errorors[errorName].message;
                err["param"] = errorName;
            }
            output.push(err);
            err = {};
        }
    }

    return output;
};