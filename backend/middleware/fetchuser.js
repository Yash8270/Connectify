const jwt = require('jsonwebtoken');
const JWT_SECRET = '##########';

const fetchuser = (req, res, next) => {
    // console.log(req.cookies);
    const token = req.cookies['auth-token'];
    // const token = req.header('auth-token');
    // console.log("token: ",token);
    if(!token) {
       return res.status(401).send({error: "Please authenticate using a valid token"});
    }

    try {
        const datastring = jwt.verify(token, JWT_SECRET);
        req.user = datastring.user;
        // console.log("Middleware: ",req.user.id);
        next();

    } catch(error) {
        return res.status(401).send({error: "Please authenticate using a valid token"});
    }
    
}

module.exports = fetchuser;