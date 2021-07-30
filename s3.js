const S3 = require('aws-sdk/clients/s3');
const fs = require('fs');
const path = require('path')
const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3 = new S3({
    region,
    accessKeyId,
    secretAccessKey
});

//upload
exports.uploadFile = function(file) {

        const fileStream = fs.createReadStream(file.location);
        const uploadParams = {
            Bucket: bucketName,
            Body: fileStream,
            Key: file.name + file.extension,
            ContentType: file.type,
            ACL: 'public-read'

        }
        return s3.upload(uploadParams).promise();
    }
    //download
exports.getFileStream = function(fileName) {
    const downloadParams = {
        Bucket: bucketName,
        Key: fileName
    }

    return s3.getObjectAcl(downloadParams).createReadStream();
}

exports.deleteFile = function(file) {

    const deleteFileParams = {
        Bucket: bucketName,
        Key: file.name + file.extension,
    }
    return s3.deleteObject(deleteFileParams).promise();
}