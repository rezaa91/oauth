import path from 'path';
import {AddressInfo} from 'net';
import express from 'express';
import bodyParser from 'body-parser';
import cons from 'consolidate';
import db from './db';
import authRoutes from './routes/auth';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.engine('html', cons.underscore);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, '../../views/authorization-server'));

app.get('/', (req, res) => {
  res.render('index', {clients: db.clients});
});

app.use('/auth', authRoutes);

const server = app.listen(5001, 'localhost', () => {
  const {address, port} = server.address() as AddressInfo;
  console.log(`Oauth authorization server listening at http://${address}:${port}`);
})
