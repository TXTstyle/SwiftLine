if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const PORT = process.env.PORT || 3000

const express = require("express");
const app = express();

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
    res.render('./index', {posts: res.posts, user: req.user, options: req.user.options, qr: req.qr})
});

//  FollowPage
app.get('/follow', mw.CheckNoAuth, mw.GetFollow, mw.GetFP, async (req,res) => { 
    res.render('./follow', {posts: res.posts, user: req.user, options: req.user.options, qr: req.qr})
});

// About
app.get('/about', mw.CheckNoAuth, mw.GetFollow, mw.GetDB, (req, res) => {
    res.render('./about', {user: req.user, options: req.user.options});
})


// Post
app.post('/new', async (req, res) => {
    const user = await myDB.FindUser(req.user.username);
    console.log(req.body.text1, user.id);

    await myDB.NewPost(req.body.text1, user.id)
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

app.post('/banner', async (req, res) => {
    const user = await myDB.FindUser(req.user.username);
    //console.log(user.id, req.body.banner)
    await myDB.NewBanner(user.id, req.body.banner)
    res.redirect('/');
})

app.post('/avatar', async (req, res) => {
    const user = await myDB.FindUser(req.user.username);
    //console.log(user.id, req.body.avatar)
    await myDB.NewAvatar(user.id, req.body.avatar)
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


app.listen(PORT, () => {
    console.log("server running!")
})