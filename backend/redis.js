const { createClient } = require('redis');

let redisClient = null;

const connectRedis = async () => {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  const host = process.env.REDIS_HOST || '127.0.0.1';
  const port = process.env.REDIS_PORT || 6379;

  redisClient = createClient({
    url: `redis://${host}:${port}`,
    socket: {
      connectTimeout: 2000,
      reconnectStrategy: false,
    },
  });

  redisClient.on('error', (err) => {
    console.log(`Redis Error: ${err.message}`);
  });

  try {
    await redisClient.connect();
    console.log('Redis Connected');
    return redisClient;
  } catch (err) {
    console.log('Redis connection failed');
    redisClient = null;
    return null;
  }
};

const getRedisClient = () => redisClient;

module.exports = { connectRedis, getRedisClient };
