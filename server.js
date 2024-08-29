const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const dotenv = require('dotenv');
const app = express();
dotenv.config();

const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.use((err,req,res,next)=>{
    console.log(err);
    res.status(err.status).json({})
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})

module.exports = app;