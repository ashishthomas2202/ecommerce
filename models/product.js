const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const productSchema = new mongoose.Schema({
    sku: {
        type: String,
        trim: true,
        required: true,
        maxlength: 15,
        unique: true
    },
    name: {
        type: String,
        trim: true,
        required: true,
        maxlength: 60,
        unique: true
    },
    ribbon: {
        type: String,
        trim: true,
        maxlength: 20
    },
    categoryId: {
        type: ObjectId,
        ref: 'Category',
        required: true
    },
    images: [{
        name: {
            type: String,
            trim: true,
            maxlength: 30
        },
        extension: {
            type: String,
            trim: true,
            maxlength: 10
        },
        location: {
            type: String,
            trim: true,
            maxlength: 50
        }
    }],
    onePrice: {
        type: Boolean,
    },
    costPrice: {
        type: Number,
        trim: true,
        required: true,
        min: 0.01,
        max: 99999
    },
    margin: {
        type: Number,
        trim: true,
        required: true,
        min: 0.01,
        max: 99999
    },
    stickerPrice: {
        type: Number,
        trim: true,
        required: true,
        min: 0.01,
        max: 99999
    },
    onSale: {
        type: Boolean,
    },
    discount: {
        amount: {
            type: Number,
            trim: true,
            min: 0.01,
            max: 99999
        },
        symbol: {
            type: String,
            trim: true,
            maxlength: 1
        }
    },
    description: {
        type: String,
        trim: true,
        required: true,
        maxlength: 400
    },
    additionalInfo: [{
        title: {
            type: String,
            trim: true,
            maxlength: 32
        },
        info: {
            type: String,
            trim: true,
            maxlength: 200
        }
    }],
    productOptions: [{
        optionTitle: {
            type: String,
            trim: true,
            maxlength: 32
        },
        varients: [{
            name: {
                type: String,
                trim: true,
                maxlength: 32
            },
            stock: [{
                costPrice: {
                    type: Number,
                    trim: true,
                    min: 0.01,
                    max: 99999
                },
                margin: {
                    type: Number,
                    trim: true,
                    min: 0.01,
                    max: 99999
                },
                stickerPrice: {
                    type: Number,
                    trim: true,
                    min: 0.01,
                    max: 99999
                },
                quantity: {
                    type: Number,
                    trim: true,
                    min: 0,
                    max: 999999
                },
                weight: {
                    value: {
                        type: Number,
                        trim: true,
                        min: 0,
                        max: 999999
                    },
                    unit: {
                        type: String,
                        trim: true,
                        maxlength: 10
                    }
                }
            }]
        }]
    }],
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);