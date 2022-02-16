import {AddressInfo} from 'net';
import express from 'express';
import bodyParser from 'body-parser';
import bookRoutes from './routes/books';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/books', bookRoutes);

const server = app.listen(5002, () => {
  const {address, port} = server.address() as AddressInfo;
  console.log(`Resource server listening at http://${address}:${port}`);
});
