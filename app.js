// Carregando Módulos
    const express = require('express');
    const handlebars = require('express-handlebars');
    const app = express();
    const admin = require('./routes/admin'); //chama um grupo de rotas
    const path = require('path');
    const mongoose = require('mongoose');
    const session = require('express-session');
    const flash = require('connect-flash');
    require('./models/Postagem');
    const Postagem = mongoose.model('postagens');

// Configurações
    // Sessão
        app.use(session({
            secret: "cursodenode",
            resave: true,
            saveUninitialized: true
        }))
    // Configuração do connect-flash
        app.use(flash())
    // Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash('success_msg');
            res.locals.error_msg = req.flash('error_msg');
            next();
        })
    // Body-Parser
        app.use(express.urlencoded({extended:true}));
        app.use(express.json())
    // Handlebars
        app.engine('handlebars', handlebars.engine());
        app.set('view engine', 'handlebars');
        // app.set('views', path.join(__dirname, 'views'));
        app.set('views', './views');
    //mongoose
        mongoose.connect('mongodb://127.0.0.1:27017/blogapp')
        .then(() => {
            console.log("Connected!");
        })
        .catch((err) => {
            console.log(`Erro: ${err}`);
        });
    // Public
        app.use(express.static(path.join(__dirname, "public")))
// Rotas
    app.use('/admin', admin); //aqui ele usa um prefixo para o grupo de rotas, nesse caso e o /admin - routes/admin.js

    app.get('/', (req, res) => {
        Postagem
        .find()
        .lean()
        .populate('categoria')
        .sort({data: 'desc'})
        .then((postagens) => {
            res.render('index', {postagens: postagens})
        })
        .catch((err) => {
            req.flash('error_msg', 'Houve um erro interno')
            res.redirect('/404')
        })
    })

    app.get('/404', (req, res) => {
        res.send('<h1>Erro 404</h1>')
    })

    app.get('/postagem/:slug', (req, res) => {
        Postagem
        .findOne({slug: req.params.slug})
        .lean()
        .then((postagem) => {
            if(postagem){
                res.render('postagem/index', {postagem: postagem})
            }else{
                req.flash('error_msg', 'Esta postagem não existe')
                res.redirect('/')
            }
        })
        .catch((err) => {
            req.flash('error_msg', 'Houve um erro interno')
            res.redirect('/')
        })
    })
// Outros
    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    })