import React from 'react';
import { Tabs, Form, Input, Button, Switch, List, Avatar, Tag, Typography } from 'antd';
import { UserOutlined, SafetyCertificateOutlined, SettingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;

const Settings: React.FC = () => {
  const { t } = useTranslation();

  const BasicSettings = () => (
    <Form layout="vertical" style={{ maxWidth: 600 }}>
      <Form.Item label={t('settings.basic.system_name')}>
        <Input defaultValue="IT Asset Management System" />
      </Form.Item>
      <Form.Item label={t('settings.basic.admin_email')}>
        <Input defaultValue="admin@company.com" />
      </Form.Item>
      <Form.Item label={t('settings.basic.enable_discovery')}>
        <Switch defaultChecked />
      </Form.Item>
      <Form.Item>
        <Button type="primary">{t('common.save')}</Button>
      </Form.Item>
    </Form>
  );

  const RBACSettings = () => (
    <List
      itemLayout="horizontal"
      dataSource={[
        { title: t('settings.rbac.admin'), desc: t('settings.rbac.admin_desc'), count: 2 },
        { title: t('settings.rbac.editor'), desc: t('settings.rbac.editor_desc'), count: 5 },
        { title: t('settings.rbac.viewer'), desc: t('settings.rbac.viewer_desc'), count: 12 },
      ]}
      renderItem={(item) => (
        <List.Item actions={[<a>{t('common.edit')}</a>, <a>{t('settings.rbac.members')}</a>]}>
          <List.Item.Meta
            avatar={<Avatar icon={<SafetyCertificateOutlined />} style={{ backgroundColor: '#1890ff' }} />}
            title={item.title}
            description={item.desc}
          />
          <Tag color="blue">{item.count} {t('common.users')}</Tag>
        </List.Item>
      )}
    />
  );

  const AuditLogs = () => (
    <List
      dataSource={[
        { action: 'Login', user: 'admin', time: '2023-10-27 10:00:00', ip: '192.168.1.5' },
        { action: 'Delete Asset', user: 'john.doe', time: '2023-10-27 09:45:12', ip: '10.0.0.2' },
      ]}
      renderItem={(item) => (
        <List.Item>
          <Typography.Text>[{item.time}] </Typography.Text>
          <Tag color="geekblue">{item.user}</Tag> 
          {t('settings.audit.performed')} 
          <Tag color="volcano">{item.action}</Tag> 
          {t('settings.audit.from')} {item.ip}
        </List.Item>
      )}
    />
  );

  const userItems = [
    { label: t('settings.tabs.basic'), key: '1', children: <BasicSettings /> },
    { label: t('settings.tabs.rbac'), key: '2', children: <RBACSettings /> },
    { label: t('settings.tabs.audit'), key: '3', children: <AuditLogs /> },
  ];

  return (
    <div>
      <Title level={2}>{t('menu.settings')}</Title>
      <Tabs defaultActiveKey="1" items={userItems} />
    </div>
  );
};

export default Settings;
