import React, { useEffect, useRef, useState } from 'react';
import { Typography, Alert, Button, Space, Input, Form, Card, message } from 'antd';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;

const WebTerminal: React.FC = () => {
  const { t } = useTranslation();
  const terminalRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [configMode, setConfigMode] = useState(true);
  const [form] = Form.useForm();

  const connect = (values: { host: string; port: string; user: string; password: string }) => {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const apiHost = import.meta.env.DEV
      ? 'localhost:8787'
      : 'itam-api.jet-s.workers.dev';
    const wsUrl = `${proto}//${apiHost}/api/v1/terminal/ws?host=${encodeURIComponent(values.host)}&port=${values.port}&user=${encodeURIComponent(values.user)}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setConfigMode(false);
      if (termRef.current) {
        termRef.current.writeln('\x1b[1;32m✓ 已连接到终端代理\x1b[0m');
        termRef.current.writeln(`\x1b[1;36m目标: ${values.host}:${values.port}\x1b[0m`);
        termRef.current.writeln('');
        termRef.current.focus();
      }
    };

    ws.onmessage = (event) => {
      if (termRef.current) {
        termRef.current.write(event.data);
      }
    };

    ws.onerror = () => {
      setConnected(false);
      setConfigMode(true);
      message.error('WebSocket 连接失败，请确认终端网关已配置');
    };

    ws.onclose = () => {
      setConnected(false);
      setConfigMode(true);
      if (termRef.current) {
        termRef.current.writeln('\r\n\x1b[1;31m✗ 连接已断开\x1b[0m');
      }
    };
  };

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: 'bar',
      fontSize: 14,
      fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', monospace",
      theme: {
        background: '#1e1e2e',
        foreground: '#cdd6f4',
        cursor: '#f5e0dc',
        selectionBackground: '#585b70',
        black: '#45475a',
        red: '#f38ba8',
        green: '#a6e3a1',
        yellow: '#f9e2af',
        blue: '#89b4fa',
        magenta: '#f5c2e7',
        cyan: '#94e2d5',
        white: '#bac2de',
        brightBlack: '#585b70',
        brightRed: '#f38ba8',
        brightGreen: '#a6e3a1',
        brightYellow: '#f9e2af',
        brightBlue: '#89b4fa',
        brightMagenta: '#f5c2e7',
        brightCyan: '#94e2d5',
        brightWhite: '#a6adc8',
      },
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    term.writeln('\x1b[1;36m╔══════════════════════════════════════╗\x1b[0m');
    term.writeln('\x1b[1;36m║     ITAM Web Terminal v2.0          ║\x1b[0m');
    term.writeln('\x1b[1;36m║     请输入连接信息开始会话            ║\x1b[0m');
    term.writeln('\x1b[1;36m╚══════════════════════════════════════╝\x1b[0m');
    term.writeln('');

    term.onData((data) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(data);
      }
    });

    termRef.current = term;

    const handleResize = () => { fitAddon.fit(); };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      wsRef.current?.close();
      term.dispose();
    };
  }, []);

  return (
    <div style={{ height: '100vh', background: '#1e1e2e', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', background: '#181825' }}>
        <Title level={4} style={{ color: '#cdd6f4', margin: 0 }}>{t('terminal.title')}</Title>
        <Space>
          <Button
            size="small"
            type={connected ? 'default' : 'primary'}
            danger={connected}
            onClick={() => {
              if (connected) {
                wsRef.current?.close();
              } else {
                setConfigMode(!configMode);
              }
            }}
          >
            {connected ? '断开' : configMode ? '隐藏' : '连接'}
          </Button>
        </Space>
      </div>

      {configMode && !connected && (
        <Card
          style={{ margin: '16px', background: '#313244', border: '1px solid #45475a' }}
          bodyStyle={{ padding: 16 }}
        >
          <Alert
            message="终端连接配置"
            description="输入目标服务器的 SSH 连接信息。终端通过 Cloudflare Workers WebSocket 代理连接到目标主机。请确保终端网关服务已部署。"
            type="info"
            showIcon
            style={{ marginBottom: 16, background: '#1e1e2e', border: '1px solid #45475a' }}
          />
          <Form form={form} layout="inline" onFinish={connect}>
            <Form.Item name="host" rules={[{ required: true, message: '输入主机地址' }]} initialValue="192.168.1.1">
              <Input placeholder="主机地址" style={{ width: 160, background: '#45475a', color: '#cdd6f4' }} />
            </Form.Item>
            <Form.Item name="port" initialValue="22">
              <Input placeholder="端口" style={{ width: 80, background: '#45475a', color: '#cdd6f4' }} />
            </Form.Item>
            <Form.Item name="user" rules={[{ required: true, message: '输入用户名' }]} initialValue="root">
              <Input placeholder="用户名" style={{ width: 120, background: '#45475a', color: '#cdd6f4' }} />
            </Form.Item>
            <Form.Item name="password">
              <Input.Password placeholder="密码" style={{ width: 140, background: '#45475a', color: '#cdd6f4' }} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">连接终端</Button>
            </Form.Item>
          </Form>
          <div style={{ marginTop: 12 }}>
            <Space size="large">
              <Button size="small" onClick={() => {
                const blob = new Blob([
                  `full address:s:192.168.1.1\nprompt for credentials:i:1\nauthentication level:i:2\n`,
                ], { type: 'application/x-rdp' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = 'connection.rdp'; a.click();
                URL.revokeObjectURL(url);
                message.success('RDP 文件已下载');
              }}>下载 RDP 连接文件</Button>
              <Button size="small" onClick={() => {
                message.info('SSH 命令行: ssh user@host -p port');
              }}>SSH 命令行帮助</Button>
            </Space>
          </div>
        </Card>
      )}

      <div ref={terminalRef} style={{ flex: 1, padding: '4px 8px' }} />
    </div>
  );
};

export default WebTerminal;
