import http from 'http';

const PORT = 8080;

function mapReason(po) {
  const globalReason = po.reason?.globalReason;
  const items = po.orderItems ?? [];

  // TC01 - move + 1 HOME
  if (
    globalReason === 'move' &&
    items.length === 1 &&
    items[0].contract?.type === 'HOME'
  ) {
    return '1942';
  }

  // TC02 - move + plusieurs HOME
  if (
    globalReason === 'move' &&
    items.length === 2 &&
    items.every(item => item.contract?.type === 'HOME')
  ) {
    return '1941';
  }

  // TC03 - customerchange
  if (globalReason === 'customerchange') {
    return '1946';
  }

  // TC04 - add
  if (
    items.length === 1 &&
    items[0].action === 'add'
  ) {
    return '1940';
  }

  // TC04 - delete
  if (
    items.length === 1 &&
    items[0].action === 'delete'
  ) {
    return '1944';
  }

  // TC04 - modify
  if (
    items.length === 1 &&
    items[0].action === 'modify'
  ) {
    return '1945';
  }

  // TC05 - add/delete ou delete/add
  if (
    items.length === 2 &&
    (
      (
        items[0].action === 'add' &&
        items[1].action === 'delete'
      ) ||
      (
        items[0].action === 'delete' &&
        items[1].action === 'add'
      )
    )
  ) {
    return '1943';
  }

  return undefined;
}

const server = http.createServer((req, res) => {

  if (req.method === 'POST' && req.url === '/po') {

    let body = '';

    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', () => {

      try {
        const po = JSON.parse(body);

        console.log('\nPOST /po');
        console.log(JSON.stringify(po, null, 2));

        const reason = mapReason(po);

        console.log('Mapped reason:', reason);

        res.writeHead(200, {
          'Content-Type': 'application/json'
        });

        res.end(JSON.stringify({
          status: 200,
          partyId: po.partyId,
          reason
        }));

      } catch (error) {

        console.error(error);

        res.writeHead(400, {
          'Content-Type': 'application/json'
        });

        res.end(JSON.stringify({
          status: 400,
          message: 'Invalid JSON'
        }));
      }
    });

    return;
  }

  res.writeHead(404, {
    'Content-Type': 'application/json'
  });

  res.end(JSON.stringify({
    status: 404,
    message: 'Not found'
  }));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`API Mock démarrée sur http://127.0.0.1:${PORT}`);
});