const redis = require('redis');
const client = redis.createClient({ url: process.env.REDIS_URL });

client.on('error', (err) => {
  console.error('Redis error:', err);
});

client.on('connect', () => {
  console.log('Connected to Redis');
});


(async () => {
  try {
    await client.connect();
  } catch (err) {
    console.error('Error connecting to Redis:', err);
  }
})();
const cache = {
  get: async (key) => {
    try {
      const data = await client.get(key);
      return data;
    } catch (err) {
      console.error('Error getting from cache:', err);
      throw err;
    }
  },
  set: async (key, value) => {
    try {
      const serializedValue = JSON.stringify(value); 
      await client.set(key, serializedValue, 'EX', 3600);
    } catch (err) {
      console.error('Error setting to cache:', err);
      throw err;
    }
  },
  del: async (key) => {
    try {
      await client.del(key);
    } catch (err) {
      console.error('Error deleting from cache:', err);
      throw err;
    }
  },
};

module.exports = cache;
