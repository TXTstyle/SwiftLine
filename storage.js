const multer = require('multer');
const path = require('path')

function storage(img) {
    return multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `public/img${img}`)
    },
    filename: (req, file, cb) => {
        console.log(file)
        cb(null, Date.now() + '.webp')
    }
})
}

module.exports = storage;