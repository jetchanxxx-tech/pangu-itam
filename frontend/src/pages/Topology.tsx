import React from 'react';
import { Card, Typography, Button } from 'antd';
import { ReloadOutlined, ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;

const Topology: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>{t('menu.topology')}</Title>
        <div>
            <Button icon={<ReloadOutlined />} style={{ marginRight: 8 }}>{t('common.refresh')}</Button>
            <Button icon={<ZoomInOutlined />} style={{ marginRight: 8 }} />
            <Button icon={<ZoomOutOutlined />} />
        </div>
      </div>
      
      <Card style={{ flex: 1, minHeight: 500, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f0f2f5' }}>
        <svg width="800" height="400" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#888"/>
            </marker>
          </defs>

          {/* Browser */}
          <g transform="translate(20, 160)">
            <rect x="0" y="0" width="120" height="70" rx="8" fill="#fff" stroke="#1890ff" strokeWidth="2"/>
            <text x="60" y="38" textAnchor="middle" fill="#333" fontSize="13" fontWeight="bold">Browser</text>
            <text x="60" y="58" textAnchor="middle" fill="#666" fontSize="11">React 18 SPA</text>
          </g>

          {/* Cloudflare Pages */}
          <g transform="translate(210, 80)">
            <rect x="0" y="0" width="130" height="60" rx="5" fill="#fff" stroke="#F38020" strokeWidth="2"/>
            <text x="65" y="25" textAnchor="middle" fill="#F38020" fontSize="11" fontWeight="bold">CF Pages</text>
            <text x="65" y="45" textAnchor="middle" fill="#666" fontSize="10">Static Assets</text>
          </g>

          {/* Cloudflare Workers */}
          <g transform="translate(210, 260)">
            <rect x="0" y="0" width="130" height="60" rx="5" fill="#fff" stroke="#F38020" strokeWidth="2"/>
            <text x="65" y="25" textAnchor="middle" fill="#F38020" fontSize="11" fontWeight="bold">CF Workers</text>
            <text x="65" y="45" textAnchor="middle" fill="#666" fontSize="10">Hono + JWT</text>
          </g>

          {/* D1 Database */}
          <g transform="translate(430, 170)">
            <path d="M0,10 A40,10 0 0,0 80,10 A40,10 0 0,0 0,10 L0,50 A40,10 0 0,0 80,50 L80,10" fill="#fff" stroke="#722ed1" strokeWidth="2"/>
            <path d="M0,10 A40,10 0 0,1 80,10" fill="none" stroke="#722ed1" strokeWidth="2"/>
            <text x="40" y="38" textAnchor="middle" fill="#333" fontSize="12" fontWeight="bold">D1</text>
            <text x="40" y="78" textAnchor="middle" fill="#666" fontSize="10">SQLite DB</text>
          </g>

          {/* Assets */}
          <g transform="translate(600, 80)">
            <rect x="0" y="0" width="150" height="60" rx="5" fill="#fff" stroke="#03DAC6" strokeWidth="2"/>
            <text x="75" y="25" textAnchor="middle" fill="#018786" fontSize="11" fontWeight="bold">Server / VM</text>
            <text x="75" y="45" textAnchor="middle" fill="#666" fontSize="10">Assets & Contracts</text>
          </g>
          <g transform="translate(600, 170)">
            <rect x="0" y="0" width="150" height="60" rx="5" fill="#fff" stroke="#03DAC6" strokeWidth="2"/>
            <text x="75" y="25" textAnchor="middle" fill="#018786" fontSize="11" fontWeight="bold">Wiki / API</text>
            <text x="75" y="45" textAnchor="middle" fill="#666" fontSize="10">Knowledge & Interfaces</text>
          </g>
          <g transform="translate(600, 260)">
            <rect x="0" y="0" width="150" height="60" rx="5" fill="#fff" stroke="#03DAC6" strokeWidth="2"/>
            <text x="75" y="25" textAnchor="middle" fill="#018786" fontSize="11" fontWeight="bold">Import / Topology</text>
            <text x="75" y="45" textAnchor="middle" fill="#666" fontSize="10">CSV Import & Graph</text>
          </g>

          {/* Connections */}
          <line x1="140" y1="195" x2="210" y2="110" stroke="#888" strokeWidth="1.5" markerEnd="url(#arrowhead)"/>
          <line x1="140" y1="195" x2="210" y2="290" stroke="#888" strokeWidth="1.5" markerEnd="url(#arrowhead)"/>
          <line x1="340" y1="110" x2="430" y2="180" stroke="#888" strokeWidth="1.5" markerEnd="url(#arrowhead)"/>
          <line x1="340" y1="290" x2="430" y2="210" stroke="#888" strokeWidth="1.5" markerEnd="url(#arrowhead)"/>
          <line x1="510" y1="190" x2="600" y2="110" stroke="#888" strokeWidth="1" strokeDasharray="4,4"/>
          <line x1="510" y1="195" x2="600" y2="195" stroke="#888" strokeWidth="1" strokeDasharray="4,4"/>
          <line x1="510" y1="200" x2="600" y2="280" stroke="#888" strokeWidth="1" strokeDasharray="4,4"/>
        </svg>
      </Card>
    </div>
  );
};

export default Topology;
