const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mysql = require('mysql'); //tem de instalar no package.json
const connection = mysql.createConnection({
  host: 'remotemysql.com', // Para quem usa no servidor local colocar localhost
  user: 'BBN9UKNJjK',
  password: '9oY9ymRE7Q',
  database: 'BBN9UKNJjK',
  port: '3306'
});
var sha1 = require('sha1'); //tem de instalar no package.json

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

app.engine('html', require('ejs').renderFile);

app.get('/projeto', (req, res) => {
  res.send('Hello Express app');
});
app.get('/admin', (req, resposta) => {
  connection.query('SELECT * FROM `usuario`', function (err, rows, fields) {
    if (err) {
      console.log('error', err.message, err.stack)
    }
    else {
      resposta.render(__dirname + '/admin.html', { usuarios: rows });
    }
  });
});
app.get('/cadastro', (req, resposta) => {
  resposta.render(__dirname + '/cadastro.html', { msg: "Cadastrado de novos usuarios" });
});

app.post('/cadastro'
  , function (request, res) {
    var nome = request.body.nome;
    var endereco = request.body.endereco;
    var cpf = request.body.cpf;
    var senha = sha1(request.body.senha);
    var motivo = request.body.motivo;
    var data = request.body.data;
    const usuario = {
      'nome': nome,
      'endereco': endereco,
      'cpf': cpf,
      'senha': senha
      'data': data
      'motivo': motivo
    };
    connection.query('INSERT INTO usuario SET ?'
      , usuario, (err, resp) => {
        if (err) {
          console.log('error'
            , err.message, err.stack)
        }
        else
          console.log('ID do ultimo inserido:'
            , resp.insertId);
      });
    res.render(__dirname + '/cadastro.html'
      , { msg: nome + " Cadastrado com Sucesso" });
  });

app.get('/editar.html/:id'
  , (req, resposta) => {
    var id = req.params.id;
    connection.query('SELECT * FROM `usuario`Where id = ?'
      , [id], function (err, rows, fields) {
        if (err) {
          console.log('error'
            , err.message, err.stack)
        }
        else {
          console.log(rows[0]);
          resposta.render(__dirname + '/editar.html'
            , { usuario: rows[0] });
        }
      });
  });

app.post('/editar.html'
  , function (request, res) {
    var nome = request.body.nome;
    var endereco = request.body.endereco;
    var cpf = request.body.cpf;
    var id = request.body.id;
    var motivo = request.body.motivo;
    var data = request.body.data;
    connection.query(
      'UPDATE usuario SET nome = ?, endereco = ?, cpf = ? Where id = ?'
      , [nome, endereco, cpf, id, motivo, data],
      (err, result) => {
        if (err) throw err;
        console.log(`Atualizado ${result.changedRows} row(s)`);
      });
    res.redirect('/admin.html');
  });


app.get('/deletar/:id'
  , (req, res) => {
    var id = req.params.id;
    connection.query('DELETE FROM `usuario` Where id = ?'
      , [id], function (err, result) {
        console.log("Registro Deletado!!");
        console.log(result);
      });
    res.redirect('/admin.html');
  });

app.listen(3000, () => console.log('server started'));
