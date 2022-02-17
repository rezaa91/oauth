import path from 'path';
import {AddressInfo} from 'net';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cons from 'consolidate';

import authRoutes from './routes/auth';
import bookRoutes from './routes/books';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.engine('html', cons.underscore);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, '../../views/client'));


app.get('/', (req, res) => {
  res.render('index');
});
app.use('/auth', authRoutes);
app.use('/books', bookRoutes);

const server = app.listen(5000, 'localhost', () => {
  const {address, port} = server.address() as AddressInfo;
  console.log(`Oauth client is listening at http://${address}:${port}`);
});
