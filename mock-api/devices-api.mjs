import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const PORT = 3001;
const DATA_FILE = join(process.cwd(), 'mock-api', 'devices.json');

function normalize(value) {
  return String(value ?? '').trim().toLowerCase();
}

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  });
  response.end(JSON.stringify(data));
}

async function readDevices() {
  const content = await readFile(DATA_FILE, 'utf-8');
  return JSON.parse(content);
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (request.method !== 'GET') {
      sendJson(response, 405, { message: 'Method not allowed' });
      return;
    }

    if (url.pathname === '/api/devices') {
      const q = normalize(url.searchParams.get('q'));
      const devices = await readDevices();

      const result = q
        ? devices.filter((device) => {
            const name = normalize(device.name);
            const code = normalize(device.code);

            return name.includes(q) || code.includes(q);
          })
        : devices;

      sendJson(response, 200, result);
      return;
    }

    if (url.pathname.startsWith('/api/devices/')) {
      const id = decodeURIComponent(url.pathname.replace('/api/devices/', ''));
      const devices = await readDevices();

      const device = devices.find(
        (item) => normalize(item.id) === normalize(id)
      );

      if (!device) {
        sendJson(response, 404, { message: 'Device not found' });
        return;
      }

      sendJson(response, 200, device);
      return;
    }

    sendJson(response, 404, { message: 'Not found' });
  } catch (error) {
    sendJson(response, 500, { message: 'Internal server error' });
  }
});

server.listen(PORT, () => {
  console.log(`Devices API running at http://localhost:${PORT}`);
});