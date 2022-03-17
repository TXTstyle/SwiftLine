const express = require('express');
const router = express.Router();
const myDB = require('../DB');
const mw = require('../middleware');


router.get('/', (req, res) => {
    res.redirect('/');
})

router.get('/:user', mw.CheckNoAuth, mw.GetUserPosts, mw.GetDB, async (req, res) => {
    
    const users = await myDB.GetUsernames();
    const user = await myDB.FindUser(req.params.user); 
    const f = await myDB.GetFollows(req.user.username)
    const following = JSON.parse(f.follows);
    
    let isFollowing = false;
    for (let i = 0; i < following.F.length; i++) {
        if (res.withFollow && following.F[i] == user.id) {
            isFollowing = true;
        }
        
    }
    if (res.posts.length <= 0) {
        res.posts = [{text: 'This user has no posts', username: req.user.username, name: user.name, avatar: user.avatar}];
    }
    const findU = users.filter( u => u.username == req.params.user);
    if (findU.length > 0) {
        const user = await myDB.FindUserId(findU[0].id)
        const N = {
        }
        
        res.render('../views/user', {posts: res.posts, user: user, following: isFollowing, mainUser: req.user, options: req.user.options, qr: req.qr})   
    }else {
        req.flash('error', 'Not a username.');
        res.redirect('/');
    }
})

router.post('/s', mw.CheckNoAuth, (req, res) => {
    const user = req.body.search; 
    res.redirect(`/user/${user}`);
})


module.exports = router;