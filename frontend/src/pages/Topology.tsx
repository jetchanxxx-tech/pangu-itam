import React from 'react';
import { Card, Typography, Empty, Button } from 'antd';
import { DeploymentUnitOutlined, ReloadOutlined, ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';
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
        {/* Simple SVG Mock for Topology */}
        <svg width="800" height="400" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
            {/* Definitions for arrow markers */}
            <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#888"/>
                </marker>
            </defs>

            {/* Load Balancer */}
            <g transform="translate(100, 180)">
                <circle cx="30" cy="30" r="30" fill="#1890ff" opacity="0.2"/>
                <circle cx="30" cy="30" r="25" fill="none" stroke="#1890ff" strokeWidth="2"/>
                <text x="30" y="35" textAnchor="middle" fill="#1890ff" fontSize="12" fontWeight="bold">LB</text>
                <text x="30" y="75" textAnchor="middle" fill="#666" fontSize="12">Nginx-Ingress</text>
            </g>

            {/* Web App Cluster */}
            <g transform="translate(350, 80)">
                <rect x="0" y="0" width="120" height="60" rx="5" fill="#fff" stroke="#52c41a" strokeWidth="2"/>
                <text x="60" y="35" textAnchor="middle" fill="#333" fontSize="14">Web App A</text>
                <text x="60" y="80" textAnchor="middle" fill="#666" fontSize="12">K8s Deployment</text>
            </g>
            
             <g transform="translate(350, 280)">
                <rect x="0" y="0" width="120" height="60" rx="5" fill="#fff" stroke="#52c41a" strokeWidth="2"/>
                <text x="60" y="35" textAnchor="middle" fill="#333" fontSize="14">API Service</text>
                <text x="60" y="80" textAnchor="middle" fill="#666" fontSize="12">Go Microservice</text>
            </g>

            {/* Database */}
             <g transform="translate(600, 180)">
                <path d="M0,10 A30,10 0 0,0 60,10 A30,10 0 0,0 0,10 L0,50 A30,10 0 0,0 60,50 L60,10" fill="#fff" stroke="#722ed1" strokeWidth="2"/>
                <path d="M0,10 A30,10 0 0,1 60,10" fill="none" stroke="#722ed1" strokeWidth="2"/>
                <text x="30" y="40" textAnchor="middle" fill="#333" fontSize="14">PostgreSQL</text>
                <text x="30" y="80" textAnchor="middle" fill="#666" fontSize="12">Primary DB</text>
            </g>

            {/* Connections */}
            <line x1="160" y1="210" x2="350" y2="110" stroke="#888" strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <line x1="160" y1="210" x2="350" y2="310" stroke="#888" strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <line x1="470" y1="110" x2="600" y2="210" stroke="#888" strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <line x1="470" y1="310" x2="600" y2="210" stroke="#888" strokeWidth="2" markerEnd="url(#arrowhead)"/>

        </svg>
      </Card>
    </div>
  );
};

export default Topology;
