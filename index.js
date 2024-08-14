const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(express.json());


 //here is connection on database......






app.get('/', (req, res) => {
    res.send('E-commerce is running')
})


app.listen(port, () => {
    console.log(`E-commerce is running on port: ${port}`)
})
