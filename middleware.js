const myDB = require('./DB');

function CheckAuth(req, res, next) {
    if(req.isAuthenticated()) {
        return res.redirect('/');
    }
    
    return next();
}
function CheckNoAuth(req, res, next) {
    if(!req.isAuthenticated()) {
        return res.redirect('/login');
    }
    return next();
}

async function GetDB(req, res, next) {
    let queryId;
    if(!req.query.page) {
        queryId = 1;
    }
    res.posts = await myDB.DB(queryId, res.withFollow, res.follows);
    return next();
}

async function GetUserPosts(req, res, next) {
    const user = await myDB.FindUser(req.params.user); 
    res.withFollow = true;
    res.follows = user.id;
    return next();
}

async function GetFollow(req, res, next) {
    const f = await myDB.GetFollows(req.user.username)
    const following = JSON.parse(f.follows);
    let fString = '';
    for (let i = 0; i < following.F.length; i++) {
        if (i == following.F.length-1) {
            fString += following.F[i];
        } else {
            fString += following.F[i]+',';
        }
    }
    if (following.F.length < 1) {
        fString = '0';
    }
    res.follows = fString;
    res.withFollow = true;
    return next();
}

module.exports = {CheckAuth, CheckNoAuth, GetDB, GetFollow, GetUserPosts};