const {Pool} = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});


// name: 45 username: 15 text: 200 password: 61 follows: 100 avatar/banner: 20 options: 45


async function DB(offset, withFollow, follows) {
    let withFollowS = ` where f.userId in (${follows})`;
    if (!withFollow) {
        withFollowS = '';
    }
    try {    
        //console.log(offset); 
        const conn = await pool.connect();
        let rows = await conn.query(`select f.text, u.username, f.id, f.userId, u.name, u.avatar from feed f inner join users u on u.id = f.userId${withFollowS} order by f.id desc limit 10 offset ${(offset-1)*10}`);
        conn.release();
        //console.log(rows.rows);
        return rows.rows;
    } catch (err) {
        throw err;
    }
} 

async function GetFollows(username) {
    try {     
        let conn = await pool.connect();
        let rows = await conn.query(`select follows from users where username='${username}'`);
        //console.log(rows.rows[0]);
        conn.release();
        return rows.rows[0];
    } catch (err) {
        throw err;
    }
}

async function NewFollow(username, follows) {
    try {     
        let conn = await pool.connect();
        let rows = await conn.query(`update users set follows='${follows}' where username='${username}'`);
        //console.log(rows[0].email);
        conn.release();
        return;
    } catch (err) {
        throw err;
    }
}

async function NewBanner(userId, banner) {
    try {     
        let conn = await pool.connect();
        let rows = await conn.query(`update users set banner='${banner}' where id='${userId}'`);
        //console.log(rows[0].email);
        conn.release();
        return;
    } catch (err) {
        throw err;
    }
}

async function NewAvatar(userId, avatar) {
    try {     
        let conn = await pool.connect();
        let rows = await conn.query(`update users set avatar='${avatar}' where id='${userId}'`);
        //console.log(rows[0].email);
        conn.release();
        return;
    } catch (err) {
        throw err;
    }
}

async function NewOptions(username, bool) {
    try {     
        let conn = await pool.connect();
        let rows = await conn.query(`update users set options='${bool}' where username='${username}'`);
        //console.log(rows[0].email);
        conn.release();
        return;
    } catch (err) {
        throw err;
    }
}

async function GetUsernames() {
    try {     
        let conn = await pool.connect();
        let rows = await conn.query(`SELECT username, id FROM users`);
        //console.log(rows[0].email);
        conn.release();
        return rows.rows;
    } catch (err) {
        throw err;
    }
} 

async function GetPostN(userId) {
    try {
        const conn = await pool.connect();
        const rows = await conn.query(`select count(userId) c from feed where userId=${userId}`);
        conn.release();
        return rows.rows[0];
    } catch (err) {
        throw err;
    }
}

async function FindUser(username) {
    try {     
        const conn = await pool.connect();
        let rows = await conn.query(`SELECT * FROM users WHERE username = '${username}'`);
        //console.log(rows.rows[0].follows);
        conn.release();
        return rows.rows[0];
    } catch (err) {
        throw err;
    }
} 

async function FindUserId(id) {
    try {     
        let conn = await pool.connect();
        let rows = await conn.query(`SELECT * FROM users WHERE id = '${id}'`);
        //console.log(rows[0].id);
        conn.release();
        return rows.rows[0];
    } catch (err) {
        throw err;
    }
} 

async function NewPost(text, userId) {
    try {
        let conn = await pool.connect();
        await conn.query(`INSERT INTO feed (text, userId) VALUES ('${text}','${userId}')`);
        conn.release();
        return;
    } catch (err) {
        throw err;
    }
}


async function NewUser(username, name, password) {
    try {
        const conn = await pool.connect();
        await conn.query(`INSERT INTO users (username, name, password) VALUES ('${username}','${name}','${password}')`);
        conn.release();
        return;
    } catch (err) {
        throw err;
    }
}

module.exports = {DB, GetUsernames, FindUser, FindUserId, GetPostN, GetFollows, NewPost, NewUser, NewFollow, NewBanner, NewAvatar, NewOptions};