const mariadb = require('mariadb');
const pool = mariadb.createPool({
    host: 'localhost',
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
    connectionLimit: 5
});


// name: 45 username: 15 text: 200 password: 61 follows: 100 avatar/banner: 20 options: 45


async function DB(offset, withFollow, follows) {
    let withFollowS = ` where f.userId in (${follows})`;
    if (!withFollow) {
        withFollowS = '';
    }
    try {     
        let conn = await pool.getConnection();
        let rows = await conn.query(`select f.text, u.username, f.id, f.userId, u.name, u.avatar, f.image from feed f inner join users u on u.id = f.userId${withFollowS} order by f.id desc limit ${(offset-1)*10},${offset*10}`);
        conn.release();
        return rows;
    } catch (err) {
        throw err;
    }
} 

async function GetFollows(username) {
    try {     
        let conn = await pool.getConnection();
        let rows = await conn.query(`select follows from users where username='${username}'`);
        //console.log(rows[0].email);
        conn.release();
        return rows[0];
    } catch (err) {
        throw err;
    }
}

async function NewFollow(username, follows) {
    try {     
        let conn = await pool.getConnection();
        let rows = await conn.query(`update users set follows='${follows}' where username='${username}'`);
        //console.log(rows[0].email);
        conn.release();
        return;
    } catch (err) {
        throw err;
    }
}

async function GetUsernames() {
    try {     
        let conn = await pool.getConnection();
        let rows = await conn.query(`SELECT username, id FROM users`);
        //console.log(rows[0].email);
        conn.release();
        return rows;
    } catch (err) {
        throw err;
    }
} 

async function GetPostN(userId) {
    try {
        const conn = await pool.getConnection();
        const rows = await conn.query(`select count(userId) c from feed where userId=${userId}`);
        conn.release();
        return rows[0];
    } catch (err) {
        throw err;
    }
}

async function FindUser(username) {
    try {     
        let conn = await pool.getConnection();
        let rows = await conn.query(`SELECT * FROM users WHERE username = '${username}'`);
        //console.log(rows[0].email);
        conn.release();
        return rows[0];
    } catch (err) {
        throw err;
    }
} 

async function FindUserId(id) {
    try {     
        let conn = await pool.getConnection();
        let rows = await conn.query(`SELECT * FROM users WHERE id = '${id}'`);
        //console.log(rows[0].id);
        conn.release();
        return rows[0];
    } catch (err) {
        throw err;
    }
} 

async function NewPost(text, userId, image) {
    try {
        let conn = await pool.getConnection();
        await conn.query(`INSERT INTO feed (text, userId, image) VALUES ('${text}','${userId}','${image}')`);
        conn.release();
    } catch (err) {
        throw err;
    }
}


async function NewUser(username, name, password) {
    try {
        let conn = await pool.getConnection();
        await conn.query(`INSERT INTO users (username, name, password) VALUES ('${username}','${name}','${password}')`);
        conn.release();
    } catch (err) {
        throw err;
    }
}

module.exports = {DB, GetUsernames, FindUser, FindUserId, GetPostN, GetFollows, NewPost, NewUser, NewFollow};