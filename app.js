const express = require('express');

const app = express();
require('dotenv').config();
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 8080;
const { sequelize } = require('./database/models/index');
const cors = require('cors');

let corsOptions = {
  origin: '*', // 출처 허용 옵션
  credential: true, // 사용자 인증이 필요한 리소스(쿠키 등) 접근
};

app.use(bodyParser.json());
app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: true }));

sequelize
  .sync()
  .then(() => console.log('connected database'))
  .catch((err) => console.error('occurred error in database connecting', err));

app.use('/user', require('./routes/user'));
app.use('/shop', require('./routes/shop'));
app.use('/review', require('./routes/review'));
app.use('/answer', require('./routes/answer'));

app.get('/', (req, res) => res.send(`Server is running at port ${PORT}`));

app.listen(PORT, '0.0.0.0');
