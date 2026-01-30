import React, { useState } from 'react';
import { Layout, Menu, Breadcrumb, Typography, Card, Tag, Input, Button, List, Divider } from 'antd';
import { ReadOutlined, FileTextOutlined, SearchOutlined, EditOutlined, BookOutlined, DeploymentUnitOutlined, ToolOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown'; // Assuming we might want this, but for now we'll use simple text or pre-rendered

const { Content, Sider } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Search } = Input;

interface DocItem {
  id: string;
  title: string;
  category: string;
  date: string;
  content: React.ReactNode;
}

const Wiki: React.FC = () => {
  const { t } = useTranslation();
  const [selectedDoc, setSelectedDoc] = useState<string | null>('1');

  const docs: DocItem[] = [
    {
      id: '1',
      title: 'System Deployment Guide',
      category: 'Deployment',
      date: '2026-01-30',
      content: (
        <div>
          <Title level={4}>1. Prerequisites</Title>
          <Paragraph>
            <ul>
              <li><strong>CPU:</strong> 2 cores minimum</li>
              <li><strong>RAM:</strong> 4GB minimum</li>
              <li><strong>OS:</strong> Linux, Windows, or macOS</li>
              <li><strong>Dependencies:</strong> Go 1.20+, Node.js 16+, SQLite/MySQL</li>
            </ul>
          </Paragraph>
          <Title level={4}>2. Backend Deployment</Title>
          <Paragraph>
            <Text code>go build -o itam-server cmd/server/main.go</Text>
            <br />
            Run with <Text code>./itam-server</Text>
          </Paragraph>
          <Title level={4}>3. Frontend Deployment</Title>
          <Paragraph>
            Build static files: <Text code>npm run build</Text>
            <br />
            Serve with Nginx or other static file server.
          </Paragraph>
        </div>
      )
    },
    {
      id: '2',
      title: 'System Architecture',
      category: 'Architecture',
      date: '2026-01-30',
      content: (
        <div>
          <Title level={4}>Overview</Title>
          <Paragraph>
            The ITAM system is designed as a Modular Monolith using Go (Gin) for the backend and React (Ant Design) for the frontend.
          </Paragraph>
          <Title level={4}>Tech Stack</Title>
          <Paragraph>
            <ul>
              <li><strong>Backend:</strong> Go, Gin, GORM, SQLite/MySQL</li>
              <li><strong>Frontend:</strong> React, Vite, Ant Design, Zustand</li>
            </ul>
          </Paragraph>
          <Title level={4}>Key Modules</Title>
          <Paragraph>
            <ul>
              <li>Asset Management (Servers, VMs)</li>
              <li>Contract Management (File Versioning)</li>
              <li>Interface Management</li>
            </ul>
          </Paragraph>
        </div>
      )
    },
    {
      id: '3',
      title: 'Operations Runbook',
      category: 'Operations',
      date: '2026-01-30',
      content: (
        <div>
          <Title level={4}>Monitoring</Title>
          <Paragraph>
            Health check endpoint: <Text code>/health</Text>
          </Paragraph>
          <Title level={4}>Maintenance</Title>
          <Paragraph>
            <strong>Database Backup:</strong>
            <br />
            <Text code>sqlite3 data/itam.db ".backup 'backups/backup.db'"</Text>
          </Paragraph>
          <Title level={4}>Incident Response</Title>
          <Paragraph>
            Check <Text code>server.log</Text> for errors. Restart service if needed.
          </Paragraph>
        </div>
      )
    }
  ];

  const activeDoc = docs.find(d => d.id === selectedDoc) || docs[0];

  return (
    <Layout style={{ background: 'transparent', height: '100%' }}>
      <Sider width={280} style={{ background: 'transparent', borderRight: '1px solid #f0f0f0' }}>
        <div style={{ padding: '0 10px 20px 0' }}>
            <Button type="primary" block icon={<EditOutlined />}>{t('wiki.create_doc')}</Button>
        </div>
        <List
          itemLayout="horizontal"
          dataSource={docs}
          renderItem={(item) => (
            <List.Item 
              style={{ 
                padding: '12px', 
                cursor: 'pointer',
                background: selectedDoc === item.id ? '#e6f7ff' : 'transparent',
                borderRadius: '6px',
                marginBottom: '4px'
              }}
              onClick={() => setSelectedDoc(item.id)}
            >
              <List.Item.Meta
                avatar={
                  item.category === 'Deployment' ? <DeploymentUnitOutlined /> :
                  item.category === 'Architecture' ? <BookOutlined /> :
                  <ToolOutlined />
                }
                title={item.title}
                description={<Text type="secondary" style={{ fontSize: '12px' }}>{item.category} • {item.date}</Text>}
              />
            </List.Item>
          )}
        />
      </Sider>
      <Layout style={{ padding: '0 24px', background: 'transparent' }}>
        <Content
          style={{
            padding: 32,
            margin: 0,
            minHeight: 280,
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
          }}
        >
          <div style={{ marginBottom: 24, borderBottom: '1px solid #f0f0f0', paddingBottom: 16 }}>
             <Tag color="blue">{activeDoc.category}</Tag>
             <Text type="secondary">Last updated: {activeDoc.date}</Text>
             <Title level={2} style={{ marginTop: 12 }}>{activeDoc.title}</Title>
          </div>
          
          <div className="wiki-content">
            {activeDoc.content}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Wiki;
