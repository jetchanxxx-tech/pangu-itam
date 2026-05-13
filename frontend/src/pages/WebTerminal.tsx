import React, { useEffect, useRef, useState } from 'react';
import { Typography, Alert, Button, Space, Input, Form, Card, message } from 'antd';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { useSearchParams } from 'react-router-dom';
import '@xterm/xterm/css/xterm.css';

const { Title } = Typography;

// Neutral dark terminal palette — no purple
const TERM_BG = '#0D1117';
const TERM_HEADER = '#161B22';
const CARD_BG = '#1C2128';
const CARD_BORDER = '#30363D';
const INPUT_BG = '#21262D';
const INPUT_TEXT = '#C9D1D9';
const INPUT_BORDER = '#30363D';
const ALERT_BG = '#161B22';
const TEXT_MUTED = '#8B949E';
const ACCENT = '#03DAC6';

const WebTerminal: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [configMode, setConfigMode] = useState(true);
  const [form] = Form.useForm();
  const [searchParams] = useSearchParams();

  // Read host/port from URL query (passed from asset connect)
  const passedHost = searchParams.get('host') || '';
  const passedPort = searchParams.get('port') || '22';

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
      if (termRef.current) termRef.current.write(event.data);
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
        background: TERM_BG,
        foreground: '#C9D1D9',
        cursor: '#03DAC6',
        selectionBackground: '#264F78',
        black: '#21262D',
        red: '#FF7B72',
        green: '#3FB950',
        yellow: '#D29922',
        blue: '#58A6FF',
        magenta: '#BC8CFF',
        cyan: '#39D2C0',
        white: '#B1BAC4',
        brightBlack: '#484F58',
        brightRed: '#FFA198',
        brightGreen: '#56D364',
        brightYellow: '#E3B341',
        brightBlue: '#79C0FF',
        brightMagenta: '#D2A8FF',
        brightCyan: '#56D4DD',
        brightWhite: '#F0F6FC',
      },
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    term.writeln(`\x1b[1;${ACCENT.replace('#', '') === '03DAC6' ? '36' : '36'}m╔══════════════════════════════════════╗\x1b[0m`);
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
    <div style={{ height: '100vh', background: TERM_BG, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '8px 20px', background: TERM_HEADER,
        borderBottom: `1px solid ${CARD_BORDER}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            width: 12, height: 12, borderRadius: '50%', background: '#FF5F57', display: 'inline-block',
          }} />
          <span style={{
            width: 12, height: 12, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block',
          }} />
          <span style={{
            width: 12, height: 12, borderRadius: '50%', background: '#27CA40', display: 'inline-block',
          }} />
          <Title level={5} style={{ color: INPUT_TEXT, margin: 0, marginLeft: 8 }}>
            ITAM Terminal {connected && <span style={{ color: ACCENT, fontSize: 12 }}>● 已连接</span>}
          </Title>
        </div>
        <Space>
          <Button
            size="small"
            onClick={() => {
              if (connected) {
                wsRef.current?.close();
              } else {
                setConfigMode(!configMode);
              }
            }}
            style={{
              background: connected ? 'rgba(255,95,87,0.15)' : 'rgba(3,218,198,0.12)',
              border: `1px solid ${connected ? '#FF5F57' : ACCENT}`,
              color: connected ? '#FF5F57' : ACCENT,
              fontWeight: 600,
            }}
          >
            {connected ? '断开连接' : configMode ? '隐藏面板' : '显示面板'}
          </Button>
        </Space>
      </div>

      {/* Config panel */}
      {configMode && !connected && (
        <Card
          style={{
            margin: 16, background: CARD_BG, border: `1px solid ${CARD_BORDER}`,
            borderRadius: 8, boxShadow: 'none',
          }}
          bodyStyle={{ padding: 20 }}
        >
          <Alert
            message="终端连接配置"
            description={passedHost
              ? `从资产管理页面跳转，已自动填入目标地址 ${passedHost}:${passedPort}`
              : '输入目标服务器的连接信息。终端通过 Cloudflare Workers WebSocket 代理连接。'}
            type="info"
            showIcon
            style={{
              marginBottom: 20, background: ALERT_BG, border: `1px solid ${CARD_BORDER}`,
              color: INPUT_TEXT,
            }}
          />

          <Form
            form={form}
            layout="inline"
            onFinish={connect}
            initialValues={{ host: passedHost, port: passedPort, user: 'root' }}
          >
            <Form.Item name="host" rules={[{ required: true, message: '输入主机地址' }]}>
              <Input
                placeholder="主机地址"
                style={{ width: 160, background: INPUT_BG, color: INPUT_TEXT, borderColor: INPUT_BORDER }}
              />
            </Form.Item>
            <Form.Item name="port">
              <Input
                placeholder="端口"
                style={{ width: 80, background: INPUT_BG, color: INPUT_TEXT, borderColor: INPUT_BORDER }}
              />
            </Form.Item>
            <Form.Item name="user" rules={[{ required: true, message: '输入用户名' }]}>
              <Input
                placeholder="用户名"
                style={{ width: 130, background: INPUT_BG, color: INPUT_TEXT, borderColor: INPUT_BORDER }}
              />
            </Form.Item>
            <Form.Item name="password">
              <Input.Password
                placeholder="密码"
                style={{ width: 140, background: INPUT_BG, color: INPUT_TEXT, borderColor: INPUT_BORDER }}
              />
            </Form.Item>
            <Form.Item>
              <Button
                htmlType="submit"
                style={{
                  background: 'transparent',
                  border: `1px solid ${ACCENT}`,
                  color: ACCENT,
                  fontWeight: 600,
                }}
              >
                连接终端
              </Button>
            </Form.Item>
          </Form>

          <div style={{ marginTop: 16 }}>
            <Space size="large">
              <Button
                size="small"
                onClick={() => {
                  const host = form.getFieldValue('host') || '192.168.1.1';
                  const port = form.getFieldValue('port') || '3389';
                  const blob = new Blob([
                    `full address:s:${host}:${port}\nprompt for credentials:i:1\nauthentication level:i:2\n`,
                  ], { type: 'application/x-rdp' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url; a.download = `${host}.rdp`; a.click();
                  URL.revokeObjectURL(url);
                  message.success(`RDP 文件已下载 (${host}:${port})`);
                }}
                style={{ color: TEXT_MUTED }}
              >
                下载 RDP 连接文件
              </Button>
              <Button
                size="small"
                onClick={() => {
                  const host = form.getFieldValue('host') || 'host';
                  const port = form.getFieldValue('port') || '22';
                  const user = form.getFieldValue('user') || 'root';
                  message.info(`SSH 命令: ssh ${user}@${host} -p ${port}`);
                }}
                style={{ color: TEXT_MUTED }}
              >
                SSH 命令行帮助
              </Button>
            </Space>
          </div>
        </Card>
      )}

      {/* Terminal viewport */}
      <div ref={terminalRef} style={{ flex: 1, padding: '4px 8px' }} />
    </div>
  );
};

export default WebTerminal;
