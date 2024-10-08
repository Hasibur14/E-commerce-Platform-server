const express = require('express')
const cors = require('cors')
const app = express()
require('dotenv').config();
const port = process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lfxjcnl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        const productCollection = client.db('primePickDB').collection('products');

        //  get all products  filtering, sorting and pagination
        app.get('/all-products', async (req, res) => {
            const size = parseInt(req.query.size);
            const page = parseInt(req.query.page) - 1;
            const search = req.query.search;
            const filter = req.query.filter;
            const brand = req.query.brand;
            const priceRange = req.query.priceRange;
            const sort = req.query.sort;
            const dateSort = req.query.dateSort;

            let query = {
                productName: { $regex: search, $options: 'i' },
            };

            // Apply filters
            if (filter) query.category = filter;
            if (brand) query.brandName = brand;

            if (priceRange) {
                const [minPrice, maxPrice] = priceRange.split('-').map(Number);
                if (maxPrice) {
                    query.price = { $gte: minPrice, $lte: maxPrice };
                } else {
                    query.price = { $gte: minPrice };
                }
            }

            let options = {};
            if (sort) options.sort = { price: sort === 'asc' ? 1 : -1 };

            // Handle date sorting
            if (dateSort) {
                options.sort = { ...options.sort, createdAt: dateSort === 'asc' ? 1 : -1 };
            }

            try {
                const result = await productCollection
                    .find(query, options)
                    .skip(page * size)
                    .limit(size)
                    .toArray();

                const count = await productCollection.countDocuments(query);

                res.send({ products: result, count });
            } catch (error) {
                res.status(500).send({ error: 'Error fetching products' });
            }
        });





        // Get all products data count from the database
        app.get('/products-count', async (req, res) => {
            try {
                const { filter: category, brand, priceRange, search = '' } = req.query;
                const query = {
                    productName: { $regex: search, $options: 'i' },
                };

                if (category) {
                    query.category = category;
                }
                if (brand) {
                    query.brandName = brand;
                }
                if (priceRange) {
                    const [minPrice, maxPrice] = priceRange.split('-').map(Number);
                    if (maxPrice) {
                        query.price = { $gte: minPrice, $lte: maxPrice };
                    } else {
                        query.price = { $gte: minPrice };
                    }
                }
                const count = await productCollection.countDocuments(query);
                res.send({ count });
            } catch (error) {
                console.error('Error fetching product count:', error);
                res.status(500).send({ error: 'Failed to fetch product count' });
            }
        });



        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('E-commerce is running')
})


app.listen(port, () => {
    console.log(`E-commerce is running on port: ${port}`)
})
