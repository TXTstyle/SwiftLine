const sharp = require('sharp')
sharp.cache(false);
const fs = require('fs');

function resize(filepath) {
    sharp(`./public/img/${filepath}`)
    .resize(1000, 1000, {withoutEnlargement: true, fit: sharp.fit.inside})
    .webp()
    .toBuffer( (err, buffer) => {
        fs.writeFile(`./public/img/${filepath}`, buffer, (e) => {
            console.log(e);
        });
        console.log(err);
    });
    
}
function cropAvatar(filepath) {
    sharp(`./public/img/${filepath}`)
    .resize(256, 256, {withoutEnlargement: true, fit: sharp.fit.cover})
    .webp()
    .toBuffer( (err, buffer) => {
        fs.writeFile(`./public/img/${filepath}`, buffer, (e) => {
            console.log(e);
        });
        console.log(err);
    });
    
}
function cropBanner(filepath) {
    sharp(`./public/img/${filepath}`)
    .resize(1000, 400, {withoutEnlargement: true, fit: sharp.fit.cover})
    .webp()
    .toBuffer( (err, buffer) => {
        fs.writeFile(`./public/img/${filepath}`, buffer, (e) => {
            console.log(e);
        });
        console.log(err);
    });
    
}

module.exports = {resize,cropAvatar,cropBanner};