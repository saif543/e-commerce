const { MongoClient } = require('mongodb');
const fs = require('fs');

async function run() {
    const envFile = fs.readFileSync('.env.local', 'utf8');
    const uriLine = envFile.split('\n').find(line => line.startsWith('MONGODB_URI='));
    const uri = uriLine ? uriLine.split('=')[1].trim() : null;

    if (!uri) {
        console.error("MONGODB_URI not found");
        return;
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('ECOM');
        const products = await db.collection('products').find({}, { projection: { name: 1, category: 1, subcategory: 1, customFields: 1, brand: 1 } }).toArray();
        console.log("Products:");
        products.forEach(p => console.log(`- [${p.name}] category="${p.category}", subcategory="${p.subcategory}"`));

        const categories = await db.collection('categories').find({}).toArray();
        console.log("\nCategories Collection:");
        categories.forEach(c => console.log(`- ${c.name}`));
    } finally {
        await client.close();
    }
}

run().catch(console.dir);
