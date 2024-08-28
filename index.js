const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database');

const app = express();
const port = 3000;

// Настройка парсера для обработки POST запросов
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Отправка HTML страницы с таблицей клиентов
app.get('/', (req, res) => {
  db.all('SELECT * FROM clients', [], (err, rows) => {
    if (err) {
      throw err;
    }
    let html = `
      <html>
      <head>
        <link rel="stylesheet" href="/bulma.min.css" />
      </head>
      <body>
      <center><h1 class="title is-1">Clients</h1>
      <img src="/logo.png" alt="Logo" width="150px"><br><br>
      <button class="button is-primary is-rounded" onclick="location.href='/add-client'">Add Client</button>
      <p>&nbsp;</p>
      <table class="table is-stripped is-centered  is-hoverable">
        <thead>
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>WA</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
    `;
    rows.forEach((row) => {
      const whatsAppNumber = row.phone.replace(/\s+/g, '');
      html += `
        <tr>
          <td>${row.id}</td>
          <td>${row.first_name}</td>
          <td>${row.last_name}</td>
          <td><a href="mailto:${row.email}">${row.email}</a></td>
          <td><a href="tel:${row.phone}">${row.phone}</a></td>
          <td><a href="https://wa.me/${whatsAppNumber}" target="_blank"><img src="/whatsapp_logo.png" alt="WhatsApp Logo" width="25px"></a></td>
          <td><a href="/edit-client/${row.id}">Edit</a>
              <a href="/delete-client/${row.id}">Delete</a>
          </td>
        </tr>
      `;
    });
    html += `
        </tbody>
      </table></center>
    `;
    res.send(html);
  });
});

// Отправка HTML формы для добавления клиента
app.get('/add-client', (req, res) => {
  res.send(`
    <html>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/1.0.2/css/bulma.min.css" integrity="sha512-RpeJZX3aH5oZN3U3JhE7Sd+HG8XQsqmP3clIbu4G28p668yNsRNj3zMASKe1ATjl/W80wuEtCx2dFA8xaebG5w==" crossorigin="anonymous" referrerpolicy="no-referrer" />
      </head>
    <body>
    <center>
    <h1 class="title is-1">Add Client</h1>
    <form action="/add-client" method="post">
      <label for="first_name">First Name:</label>
      <input type="text" id="first_name" name="first_name" required><br>
      <label for="last_name">Last Name:</label>
      <input type="text" id="last_name" name="last_name" required><br>
      <label for="email">Email:</label>
      <input type="email" id="email" name="email" required><br>
      <label for="phone">Phone:</label>
      <input type="text" id="phone" name="phone" required><br>
      <p>&nbsp;</p>
      <input class="button is-primary is-rounded" type="submit" value="Submit">
    </form>
    </center>
    </body>
    </html>
  `);
});

// Обработка POST запроса для добавления клиента
app.post('/add-client', (req, res) => {
  const { first_name, last_name, email, phone } = req.body;
  const query = `INSERT INTO clients (first_name, last_name, email, phone) VALUES (?, ?, ?, ?)`;
  db.run(query, [first_name, last_name, email, phone], function (err) {
    if (err) {
      console.error('Error inserting data:', err.message);
      res.status(500).send('Error inserting data.');
    } else {
      res.redirect('/');
    }
  });
});

// Отправка формы для редактирования клиента
app.get('/edit-client/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM clients WHERE id = ?', [id], (err, row) => {
    if (err) {
      throw err;
    }
    if (row) {
      res.send(`
        <html>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/1.0.2/css/bulma.min.css" integrity="sha512-RpeJZX3aH5oZN3U3JhE7Sd+HG8XQsqmP3clIbu4G28p668yNsRNj3zMASKe1ATjl/W80wuEtCx2dFA8xaebG5w==" crossorigin="anonymous" referrerpolicy="no-referrer" />
      </head>
    <body>
    <center>
        <h1 class="title is-1">Edit Client</h1>
        <form action="/edit-client/${row.id}" method="post">
          <label for="first_name">First Name:</label>
          <input type="text" id="first_name" name="first_name" value="${row.first_name}" required><br>
          <label for="last_name">Last Name:</label>
          <input type="text" id="last_name" name="last_name" value="${row.last_name}" required><br>
          <label for="email">Email:</label>
          <input type="email" id="email" name="email" value="${row.email}" required><br>
          <label for="phone">Phone:</label>
          <input type="text" id="phone" name="phone" value="${row.phone}" required><br>
          <p>&nbsp;</p>
          <input class="button is-primary is-rounded" type="submit" value="Update">
        </form>
         </center>
      </body>
      </html>
      `);
    } else {
      res.status(404).send('Client not found');
    }
  });
});

// Обработка POST запроса для обновления данных клиента
app.post('/edit-client/:id', (req, res) => {
  const id = req.params.id;
  const { first_name, last_name, email, phone } = req.body;
  const query = `UPDATE clients SET first_name = ?, last_name = ?, email = ?, phone = ? WHERE id = ?`;
  db.run(query, [first_name, last_name, email, phone, id], function (err) {
    if (err) {
      console.error('Error updating data:', err.message);
      res.status(500).send('Error updating data.');
    } else {
      res.redirect('/');
    }
  });
});


// Отправка HTML страницы подтверждения удаления клиента
app.get('/delete-client/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM clients WHERE id = ?', [id], (err, row) => {
    if (err) {
      throw err;
    }
    if (row) {
      res.send(`
         <html>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/1.0.2/css/bulma.min.css" integrity="sha512-RpeJZX3aH5oZN3U3JhE7Sd+HG8XQsqmP3clIbu4G28p668yNsRNj3zMASKe1ATjl/W80wuEtCx2dFA8xaebG5w==" crossorigin="anonymous" referrerpolicy="no-referrer" />
      </head>
    <body>
    <center>
        <h1 class="title is-1">Confirm Deletion</h1>
        <p>Are you sure you want to delete the client?</p>
        <form action="/delete-client/${id}" method="post">
          <p>&nbsp;</p>
          <button class="button is-primary is-rounded" type="submit">Yes</button>
        </form>
          <button class="button is-info" onclick="location.href=history.back()">No</button>
      </center>
      </body>
      </html>
      `);
    } else {
      res.status(404).send('Client not found');
    }
  });
});


// Обработка POST запроса для удаления клиента
app.post('/delete-client/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM clients WHERE id = ?', [id], function (err) {
    if (err) {
      console.error('Error deleting data:', err.message);
      res.status(500).send('Error deleting data.');
    } else {
      res.redirect('/');
    }
  });
});



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
