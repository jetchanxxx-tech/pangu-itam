import React, { useEffect, useRef } from 'react';
import { Typography, Alert } from 'antd';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

const WebTerminal: React.FC = () => {
  const { t } = useTranslation();
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Mocking terminal output
    const mockOutput = [
      "Connecting to server 192.168.1.10...",
      "Authenticating...",
      "Welcome to Ubuntu 22.04.2 LTS (GNU/Linux 5.15.0-76-generic x86_64)",
      "",
      " * Documentation:  https://help.ubuntu.com",
      " * Management:     https://landscape.canonical.com",
      " * Support:        https://ubuntu.com/advantage",
      "",
      "System information as of " + new Date().toString(),
      "",
      "admin@prod-db-01:~$ "
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (terminalRef.current && i < mockOutput.length) {
        const p = document.createElement('div');
        p.textContent = mockOutput[i];
        terminalRef.current.appendChild(p);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#000', color: '#0f0', padding: 20, fontFamily: 'monospace' }}>
       <Title level={4} style={{ color: '#fff', marginBottom: 10 }}>{t('terminal.title')}</Title>
       <Alert message={t('terminal.warning')} type="warning" banner style={{marginBottom: 20}}/>
       <div ref={terminalRef} style={{ flex: 1, overflowY: 'auto' }}>
         {/* Terminal content will appear here */}
       </div>
    </div>
  );
};

export default WebTerminal;
