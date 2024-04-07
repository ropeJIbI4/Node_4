const express = require('express');
const fs = require('fs');

const usersFile = './users.json';

const generateUniqueId = () => {
  const maxId = users.length > 0? Math.max(...users.map((u) => u.id)) : 0;
  return maxId + 1;
};

let users = [];

fs.readFile(usersFile, 'utf8', (err, data) => {
  if (err) {
    if (err.code === 'ENOENT') {
      fs.writeFile(usersFile, JSON.stringify([]), (err) => {
        if (err) throw err;
        console.log('Файл пользователей не найден, создаем новый...');
      });
    } else {
      throw err;
    }
  } else {
    users = JSON.parse(data);
    console.log('Файл пользователей найден');
  }
});

const app = express();
const port = 3000;

app.use(express.json());

app.get('/users', (req, res) => {
  res.send(users);
});

app.get('/users/:id', (req, res) => {
  const user = users.find((u) => u.id === parseInt(req.params.id));
  if (user) {
    res.send(user);
  } else {
    res.status(404).send({ message: 'Пользователь не найден' });
  }
});


app.post('/users', (req, res) => {
  const newUser = req.body;
  newUser.id = generateUniqueId(); 
  users.push(newUser);
  fs.writeFile(usersFile, JSON.stringify(users), (err) => {
    if (err) throw err;
    res.status(201).send(newUser);
  });
});


app.put('/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const updatedUser = req.body;
  const userIndex = users.findIndex((u) => u.id === id);
  if (userIndex!== -1) {
    users[userIndex] = updatedUser;
    try {
      fs.writeFile(usersFile, JSON.stringify(users), (err) => {
        if (err) throw err;
        res.send(updatedUser);
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Ошибка при обновлении пользователя' });
    }
  } else {
    res.status(404).send({ message: 'Пользователь не найден' });
  }
});


app.delete('/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const userIndex = users.findIndex((u) => u.id === id);
  if (userIndex!== -1) {
    users.splice(userIndex, 1);
    try {
      fs.writeFile(usersFile, JSON.stringify(users), (err) => {
        if (err) throw err;
        res.status(204).send();
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Ошибка при удалении пользователя' });
    }
  } else {
    res.status(404).send({ message: 'Пользователь не найден' });
  }
})

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});