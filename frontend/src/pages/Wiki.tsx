import React from 'react';
import { Layout, Menu, Breadcrumb, Typography, Card, Tag, Input, Button, List } from 'antd';
import { ReadOutlined, FileTextOutlined, SearchOutlined, EditOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Content, Sider } = Layout;
const { Title, Paragraph } = Typography;
const { Search } = Input;

const Wiki: React.FC = () => {
  const { t } = useTranslation();

  const mockDocs = [
    { title: 'Server Initialization Guide', category: 'Ops', date: '2023-10-20' },
    { title: 'Database Backup & Recovery', category: 'DBA', date: '2023-10-18' },
    { title: 'Application Deployment Standard', category: 'Dev', date: '2023-09-15' },
    { title: 'Troubleshooting: High CPU Usage', category: 'Ops', date: '2023-11-01' },
  ];

  return (
    <Layout style={{ background: 'transparent' }}>
      <Sider width={250} style={{ background: 'transparent' }}>
        <div style={{ padding: '0 10px 20px 0' }}>
            <Button type="primary" block icon={<EditOutlined />}>{t('wiki.create_doc')}</Button>
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={['1']}
          style={{ height: '100%', borderRight: 0, borderRadius: 8 }}
          items={[
            { key: '1', icon: <ReadOutlined />, label: t('wiki.all_docs') },
            { key: '2', icon: <FileTextOutlined />, label: t('wiki.ops_manual') },
            { key: '3', icon: <FileTextOutlined />, label: t('wiki.troubleshooting') },
            { key: '4', icon: <FileTextOutlined />, label: t('wiki.arch_docs') },
          ]}
        />
      </Sider>
      <Layout style={{ padding: '0 24px' }}>
        <Content
          style={{
            padding: 24,
            margin: 0,
            minHeight: 280,
            background: '#fff',
            borderRadius: 8
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <Title level={3} style={{ margin: 0 }}>{t('wiki.knowledge_base')}</Title>
            <Search placeholder={t('wiki.search_placeholder')} style={{ width: 300 }} />
          </div>

          <List
            itemLayout="horizontal"
            dataSource={mockDocs}
            renderItem={(item) => (
              <List.Item actions={[<a>{t('wiki.view')}</a>, <a>{t('common.edit')}</a>]}>
                <List.Item.Meta
                  avatar={<FileTextOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                  title={<a href="#">{item.title}</a>}
                  description={
                    <span>
                      <Tag color="blue">{item.category}</Tag>
                      {t('wiki.last_updated')}: {item.date}
                    </span>
                  }
                />
              </List.Item>
            )}
          />

          <Card title={`${t('wiki.preview')}: Server Initialization Guide`} style={{ marginTop: 30, background: '#fafafa' }}>
            <Paragraph>
              ### 1. Update System
              <br/>
              `sudo apt update && sudo apt upgrade -y`
              <br/><br/>
              ### 2. Install Docker
              <br/>
              `curl -fsSL https://get.docker.com | sh`
              <br/><br/>
              ### 3. Configure Firewall
              <br/>
              `ufw allow 22/tcp`
              <br/>
              `ufw allow 80/tcp`
              <br/>
              `ufw enable`
            </Paragraph>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Wiki;
