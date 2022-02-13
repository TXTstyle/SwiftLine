if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require("express");
const multer = require('multer')
const app = express();
const fs = require('fs');

const bcrypt = require('bcrypt');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const myDB = require('./DB');
const mw = require('./middleware');

const passport = require('passport');
const initialize = require('./passport-config');
initialize(passport, 
    async username => {
        return await myDB.FindUser(username);
    },
    async id => {
        return await myDB.FindUserId(id);
    }); 



const userRouter = require('./routes/user');
const storage = require('./storage');
const sharpImg = require('./sharpImg');

const uploadPost = multer({storage: storage('/posts/')})
const uploadBanner = multer({storage: storage('/banners/')})
const uploadAvatar = multer({storage: storage('/avatars')})

app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({
    extended:false
}));
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.session())
app.use(methodOverride('_method'))
app.use('/user', userRouter)



//  ---  Routing  ---

//  Root
app.get('/', mw.CheckNoAuth, mw.GetFollow, mw.GetDB, async (req,res) => { 
    res.render('./index', {posts: res.posts, user: req.user, options: req.user.options})
});


// Post
app.post('/new', uploadPost.single('image1'), async (req, res) => {
    const user = await myDB.FindUser(req.user.username);
    sharpImg.resize(`posts/${req.file.filename}`);
    console.log(req.body.text1, user.id, req.file.filename);

    await myDB.NewPost(req.body.text1, user.id, req.file.filename)
    res.redirect('/');
})

app.get('/new', mw.CheckNoAuth, (req, res) => {
    //console.log(req.user.avatar)
    res.render('./new', {user: req.user, options: req.user.options});
})

// Settings

app.get('/settings', mw.CheckNoAuth, (req, res) => {
    res.render('./settings', {user: req.user, options: req.user.options});
})

app.post('/banner', mw.DelBanner, uploadBanner.single('banner1'), async (req, res) => {
    const user = await myDB.FindUser(req.user.username);
    sharpImg.cropBanner(`banners/${req.file.filename}`);

    await myDB.NewBanner(user.id, req.file.filename)
    res.redirect('/');
})

app.post('/avatar', mw.DelAvatar, uploadAvatar.single('avatar1'), async (req, res) => {
    const user = await myDB.FindUser(req.user.username);
    sharpImg.cropAvatar(`avatars/${req.file.filename}`);

    await myDB.NewAvatar(user.id, req.file.filename)
    res.redirect('/');
})

app.post('/settings', (req, res) => {
    const un = req.body.dark1;
    if (un == 'on') {
        myDB.NewOptions(req.user.username, 1);
    } else {
        myDB.NewOptions(req.user.username, 0);
    }
    res.redirect('/');
})

//  Login
app.get('/login', mw.CheckAuth, (req, res) => {
    res.render('./login')
})

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

//  Register
app.get('/register', mw.CheckAuth,(req, res) => {
    res.render('./register')
})

app.post('/register', async (req, res) => {
    try {
        const hp = await bcrypt.hash(req.body.password1, 8);
        const nn = req.body.name1;
        const un = req.body.username1;
        
        
        const ifName = await myDB.FindUser(un);
        if(ifName == null) {
            await myDB.NewUser(un,nn,hp);
            console.log(ifName,un,nn,hp);
            res.redirect('/login');
        } else {
            req.flash('error', 'Username already in use.');
            res.redirect('/register')
        }

        
    } catch (error) {
        throw error
    }
})

// Follow

app.post('/follow', async (req, res) => {
    const f = await myDB.GetFollows(req.user.username)
    const following = JSON.parse(f.follows);
    const user = await myDB.FindUser(req.query.user); 
    following.F.push(user.id)
    const newF = JSON.stringify(following)
    await myDB.NewFollow(req.user.username, newF);
    res.redirect(`/user/${req.query.user}`)
})

app.delete('/unfollow', async (req, res) => {
    const f = await myDB.GetFollows(req.user.username)
    const following = JSON.parse(f.follows);
    const user = await myDB.FindUser(req.query.user); 
    const unF = following.F.indexOf(user.id);
    following.F.splice(unF);
    const newF = JSON.stringify(following)
    await myDB.NewFollow(req.user.username, newF);
    res.redirect(`/user/${req.query.user}`)
})



// Logout
app.delete('/logout', (req, res) => {
    req.logOut();
    res.redirect('/')
})

app.use((req, res, next) => {
    res.status(404).render('./error', {error: '404: Page not found'});
    next();
})


app.listen(2000, () => {
    console.log("server running!")
})