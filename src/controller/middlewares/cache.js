const { createClient } = require('redis');

const redisGet = async ( key ) => {
    const client = createClient();
  
    client.on('error', (err) => console.log('Redis Client Error', err));
  
    await client.connect();
  
    const data = await client.get(key);

    return data;
  };

  const redisSet = async ( key, data ) => {
    const client = createClient();
  
    client.on('error', (err) => console.log('Redis Client Error', err));
  
    await client.connect();

    await client.set(key, data);
  };

  const redisUpdate = async ( key, data ) => {
    const client = createClient();
  
    client.on('error', (err) => console.log('Redis Client Error', err));
  
    await client.connect();

    await client.del( key );
    await client.set(key, data);
  };

module.exports = {
    redisGet,
    redisSet,
    redisUpdate
}