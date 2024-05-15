const client = require('./client');

async function init() {
    await client.set("msg:4", "how are you prakash");
    const result = await client.get('msg:4');
    console.log("result: =", result);
}

init()