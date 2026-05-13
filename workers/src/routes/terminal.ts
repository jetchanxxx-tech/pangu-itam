// WebSocket terminal proxy for SSH connections via Cloudflare Workers
import type { Env } from '../index';

export function handleTerminalWs(request: Request, env: Env): Response {
  const url = new URL(request.url);
  const host = url.searchParams.get('host') || '';
  const port = url.searchParams.get('port') || '22';
  const user = url.searchParams.get('user') || 'root';

  if (!host) {
    return new Response('Missing host parameter', { status: 400 });
  }

  // Create a WebSocket pair: one for the client, one for the backend
  const [clientWs, serverWs] = Object.values(new WebSocketPair());

  // Accept the client WebSocket
  serverWs.accept();

  // Send welcome message
  serverWs.send(`Connecting to ${user}@${host}:${port}...\n`);

  // Note: Cloudflare Workers cannot initiate outbound TCP connections.
  // To enable real SSH proxying, deploy a terminal gateway service
  // (e.g., ttyd, websockify) and configure the URL below.
  //
  // For production use, set the TERMINAL_GATEWAY_URL environment variable
  // to your WebSocket-to-SSH gateway endpoint.
  const gatewayUrl = env.TERMINAL_GATEWAY_URL;

  if (gatewayUrl) {
    // Proxy WebSocket messages to/from the gateway
    serverWs.addEventListener('message', async (msg) => {
      try {
        const backendWs = await connectToGateway(gatewayUrl, host, port, user);
        if (backendWs) {
          backendWs.send(msg.data as string);
          backendWs.addEventListener('message', (backendMsg) => {
            serverWs.send(backendMsg.data as string);
          });
        }
      } catch {
        serverWs.send('\n\x1b[1;31m✗ 无法连接到目标主机。请检查终端网关配置。\x1b[0m\n');
      }
    });

    serverWs.send('终端网关已就绪，等待输入...\r\n');
  } else {
    // No gateway configured — terminal is in demo mode
    serverWs.send('\n\x1b[1;33m⚠ 终端网关未配置\x1b[0m\n');
    serverWs.send('请设置环境变量 TERMINAL_GATEWAY_URL 以启用真实 SSH 代理。\n');
    serverWs.send('部署终端网关服务 (如 ttyd) 并将其 URL 配置到 Workers 环境变量。\n\n');
    serverWs.send('\x1b[1;36m命令参考:\x1b[0m\n');
    serverWs.send('  1. 部署 ttyd: docker run -d -p 7681:7681 tsl0922/ttyd bash\n');
    serverWs.send('  2. 部署 websockify: websockify 8022 your-ssh-server:22\n');
    serverWs.send('  3. 设置 Workers 环境变量: wrangler secret put TERMINAL_GATEWAY_URL\n');
    serverWs.send('\n');
  }

  serverWs.addEventListener('close', () => {
    serverWs.close();
  });

  return new Response(null, { status: 101, webSocket: clientWs });
}

async function connectToGateway(
  gatewayUrl: string, host: string, port: string, user: string
): Promise<WebSocket | null> {
  const url = `${gatewayUrl}?host=${encodeURIComponent(host)}&port=${port}&user=${encodeURIComponent(user)}`;
  const ws = new WebSocket(url);
  return new Promise((resolve) => {
    ws.addEventListener('open', () => resolve(ws));
    ws.addEventListener('error', () => resolve(null));
    setTimeout(() => resolve(null), 5000);
  });
}
