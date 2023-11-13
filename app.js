import express from "express"
import mongoose from "mongoose"
import passport from "passport"
import cookieParser from "cookie-parser"
import jwt from "jsonwebtoken"
//import session from "express-session"
import { Strategy as JwtStrategy } from 'passport-jwt';
import { ExtractJwt as ExtractJwt } from 'passport-jwt';
import * as path from "path"
import __dirname, { authorization, passportCall } from "./utils.js"
import initializePassport from "./config/passport.config.js"
import mongoStore from "connect-mongo"
import UserManager from "./controllers/UserManager.js"
import CartManager from "./controllers/CartManager.js"
import { generateAndSetToken } from "./jwt/token.js"

const users = new UserManager();
const carts = new CartManager();
const app = express()



const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: "Secret-key"
}

passport.use(
    new JwtStrategy(jwtOptions, (jwt_payload, done)=>{
        const user = users.find((user) =>user.email ===jwt_payload.email)
        if(!user)
        {
            return done(null, false, {message:"Usuario no encontrado"})
        }
        return done(null, user)
    })
)

app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.use(cookieParser());
initializePassport();
app.use(passport.initialize());

app.post("/login", async(req,res)=>{
    try {
        const {email, password} = req.body
        const emailToFind = email;
        const user = await users.findEmail({email: emailToFind})
        //const user = await users.findEmail({email: email});
        if(!user || user.password !== password){
        return res.status(401).json({message: "Error de autenticacion"})
        }
        const token = generateAndSetToken(res, email, password);
        res.json({token, user: { email: user.email, rol:user.rol}});
    } catch (error) {
        console.error("Error en el proceso de inicio de sesion", error )
        return res.status(500).json({message: "Error interno del servidor"});
    }
    
})
app.post("/api/register", async (req, res) =>{
    const {first_name, last_name, email, age, password, rol} = req.body
    const emailToFind = email
    const exists = await users.findEmail({email: emailToFind})
    if(exists) return res.status(400).send({status: "error", error: "Usuario ya existe"})
    const newUser = {
        first_name, 
        last_name, 
        email, 
        age, 
        password,
        cart: carts.addCart(),
        rol
    }
    users.addUser(newUser)
    const token = generateAndSetToken(res, email, password)
    res.send({token})
})


app.get('/', (req, res) => {
    res.sendFile('index.html', { root: app.get('views') });
});

app.get("/register", (req, res) => {
    res.sendFile("register.html", { root: app.get('views') });
})

app.get('/current', passportCall('jwt'), authorization('user'), (req,res) =>{
    console.log("Ruta /current alcanzada con exito.")
    res.sendFile("home.html", { root: app.get('views') });
})

app.listen(8080, () => {
    console.log("Servidor corriendo en puerto 8080")
})
//-------------------------------------Mongoose----------------------------------------------------------//
mongoose.connect("mongodb+srv://user123:luis12@proyectocoder.sqvx5rc.mongodb.net/?retryWrites=true&w=majority")
.then(()=>{
    console.log("Conectado con Mongo Atlas")
})
.catch(error => {
    console.error("Error al conectarse a la base de datos, error"+error)
})