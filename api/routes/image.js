const aws = require("@pulumi/aws"); 
const { parseBody } = require("../utils")

const { headers } = require("./headers")

const uploadImage = async (event, { bucket }) => {

    console.log("uploading image ")
    try {
        if (event) {

            console.log("EVENT: \n" + JSON.stringify(event, null, 2))

            const body = parseBody(event)

            console.log("BODY: \n", body)

            const base64String = body.image;  
            const buffer = Buffer.from(base64String.replace(/^data:image\/\w+;base64,/, ""),"base64");
           
            const s3 = new aws.sdk.S3()

            const arr = body.image.split(',')
            let contentType = ""
            let extension = ""
            switch (arr[1][0]) {
                case '/': 
                    contentType = 'image/jpeg'
                    extension = ".jpg"
                    break;
                case 'i': 
                    contentType = 'image/png'
                    extension = ".png"
                    break;
                case 'R': 
                    contentType = 'image/gif'
                    extension = ".gif"
                    break;
                case 'U': 
                    contentType = 'image/webp'
                    extension = ".webp"
                    break;
            }

            if (extension === "") {
                throw new Error('The string supplied is not a file type');
            } 

            const filename = String(Date.parse(new Date())).slice(-12, -3) + extension

            let params = {
                Bucket: `${bucket['bucket'].value}`,
                Key: filename,
                Body: buffer,
                ContentType: contentType
            };

            const uploadedImage = await s3.upload(params).promise()

            console.log("Upload images completed")
 
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    "status": "ok",
                    "filename" : filename
                }),
            }

        } else {
            throw new Error("Body is not provided")
        }
    } catch (error) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
                status: "error",
                message: `${error || "Unknown error."}`
            }),
        };
    }

}


const uploadJson = async (event, { bucket }) => {

    console.log("uploading JSON ")
    try {
        if (event) {

            console.log("EVENT: \n" + JSON.stringify(event, null, 2))

            const body = parseBody(event)

            console.log("BODY: \n", body)

            const base64String = body.json;  
            const cid = body.cid

            const buffer = Buffer.from(JSON.stringify(base64String));

            const s3 = new aws.sdk.S3()

            const filename = cid + ".json"

            let params = {
                Bucket: `${bucket['bucket'].value}`,
                Key: filename,
                Body: buffer,
                ContentEncoding: 'base64',
                ContentType: 'application/json',
            };

            await s3.upload(params).promise()

            console.log("Upload JSON completed")
 
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    "status": "ok",
                    "filename" : filename
                }),
            }

        } else {
            throw new Error("Body is not provided")
        }
    } catch (error) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
                status: "error",
                message: `${error || "Unknown error."}`
            }),
        };
    }

}


module.exports = {
    uploadImage,
    uploadJson
}