const port = process.env.PORT || 1953;
const app = require('./app');
const db = require('./db')

const init = async () => {
    await db.syncAndSeed();
    app.listen(port, ()=> console.log(`listening on port ${port}`));
};

init();
