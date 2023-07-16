const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Categoria');
const Categoria = mongoose.model('categorias');
require('../models/Postagem');
const Postagem = mongoose.model('postagens');

router.get('/', (req, res) => {
    res.render("admin/index")
})

router.get('/posts', (req, res) => {
    res.send("Página de Posts")
})
// Nova Feature: Arrumar a máscara da data
router.get('/categorias', (req, res) => {
    Categoria.find().sort({date: 'desc'}).lean().then((categorias) => {
        res.render('admin/categorias', {categorias: categorias});
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao listar as catrgorias!');
        res.redirect('/admin');
    })
})

router.get('/categorias/add', (req, res) => {
    res.render('admin/addcategorias');
})

router.post('/categorias/nova', (req, res) => {
    var erros = [];

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido"})
    }

    if(req.body.nome.length < 2){
        erros.push({texto: "Nome da categoria muito pequeno"})
    }

    if(erros.length > 0 ){
        res.render('admin/addcategorias', {erros: erros});
    } else {
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Categoria(novaCategoria).save()
        .then(() => {
            req.flash('success_msg', `Categoria ${novaCategoria.nome} criada com sucesso!`)
            console.log(`Categoria ${novaCategoria.nome} criada com sucesso, REDIRECIONANDO...`);
            res.redirect('/admin/categorias');
        })
        .catch((err) => {
            req.flash('error_msg', `Houve um erro ao salvar a categoria ${novaCategoria.nome}, tente novamente!`);
            console.log(`Erro ao salvar a categoria ${novaCategoria.nome} - ${err}`);
            res.redirect('/admin');
        })
    }
})
// Puxa do bd e deixa nos imputs
// Nova Feature: precisa colocar validação de espaços
router.get('/categorias/edit/:id', (req, res) => {
    Categoria.findOne({_id:req.params.id})
    .lean()
    .then((categoria) => {
        res.render('admin/editcategorias', {categoria: categoria})
    })
    .catch((err) => {
        req.flash('error_msg', 'Esta categoria não existe');
        res.redirect('/admin/categorias');
    })  
})
// Faz a edição da categoria
// Nova Feature:: precisa colocar validação
router.post('/categorias/edit', (req, res) => {
    Categoria.findOne({_id: req.body.id})
    .then((categoria) => {
            categoria.nome = req.body.nome;
            categoria.slug = req.body.slug;
            categoria
            .save()
            .then(() => {
                console.log(`Categoria editada com sucesso, REDIRECIONANDO...`)
                req.flash('success_msg', 'Categoria editada com sucesso')
                res.redirect('/admin/categorias')
            })
            .catch((err) => {
                req.flash('error_msg', 'Houve um erro interno ao salvar a categoria')
                res.redirect('/admin/categorias')
            })
    })
    .catch((err) => {
        req.flash('error_msg', 'Não foi possível editar a categoria')
        res.redirect('/admin/categorias')
    })
})

router.post('/categorias/deletar', (req, res) => {
    Categoria.deleteOne({_id: req.body.id})
    .then(() => {
        console.log(`Categoria deletada com sucesso, REDIRECIONANDO...`)
        req.flash('success_msg', 'Categoria deletada com sucesso')
        res.redirect('/admin/categorias')
    })
    .catch((err) => {
        req.flash('error_msg', 'Houve um erro ao deletar a categoria')
        res.redirect('/admin/categorias')
    })
})

router.get('/postagens', (req, res) => {
    Postagem
    .find()
    .populate('categoria')// conforme esta no model
    .sort({date: 'desc'})
    .lean()
    .then((postagens) => {
        res.render('admin/postagens', {postagens: postagens});
    })
    .catch((err) => {
        req.flash('error_msg', 'Houve um erro ao listar as postagens!');
        res.redirect('/admin');
    })
})
// Nova Feature:: precisa colocar validação
router.get('/postagens/add', (req, res) => {
    Categoria
    .find()
    .lean()
    .then((categorias) => {
        res.render('admin/addpostagem', {categorias: categorias})
    })
    .catch((err) => {
        req.flash('error_msg', 'Houve um erro ao carregar o formulário')
        res.redirect('/admin');
    })
})

router.post('/postagens/nova', (req, res) => {
    var erros = []

    if(req.body.categoria == '0'){
        erros.push({texto: 'Categoria inválida, registre uma categoria'})
    }

    if(erros.length > 0){
        res.render('admin/addpostagem', {erros: erros})
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }

        new Postagem(novaPostagem)
        .save()
        .then(() => {
            req.flash('success_msg', 'Postagem criada com sucesso!')
            res.redirect('/admin/postagens')
        })
        .catch((err) => {
            req.flash('error_msg', 'Houve um erro ao criar a Postagem')
            res.redirect('/admin/postagens')
        })
    }
})
    
module.exports = router;