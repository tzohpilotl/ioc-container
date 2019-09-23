const hapi = require('@hapi/hapi');

const delay = ms => () => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

const delay1000 = delay(1000);

const init = async () => {
  const server = hapi.server({
    port: 3000,
    host: 'localhost',
  });

  server.route({
    method: 'GET',
    path: '/',
    handler: async (request, hapi) => {
      await delay1000();
      return request;
    }
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();
