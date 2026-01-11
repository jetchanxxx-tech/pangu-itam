import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Progress, List, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, CheckCircleOutlined, WarningOutlined, SafetyCertificateOutlined, AlertOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { getDashboardStats, DashboardStats } from '../services/api';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      }
    };
    fetchData();
  }, []);

  const data = [
    { title: t('dashboard.total_assets'), value: stats?.total_assets || 0, prefix: <ArrowUpOutlined />, color: '#3f8600' },
    {
      title: t('dashboard.ueba_risk_score'),
      value: stats?.ueba_score || 0,
      color: '#52c41a',
      prefix: <SafetyCertificateOutlined />,
      suffix: '/ 100',
      desc: t('dashboard.user_behavior_analytics')
    },
    {
      title: t('dashboard.active_alerts'),
      value: stats?.active_alerts || 0,
      color: '#cf1322',
      prefix: <AlertOutlined />,
      desc: t('dashboard.critical_issues')
    },
    { title: t('dashboard.sla_compliance'), value: stats?.sla_compliance || 0, suffix: '%', prefix: <CheckCircleOutlined />, color: '#3f8600' },
    { title: t('dashboard.pending_audits'), value: stats?.pending_audits || 0, prefix: <ArrowDownOutlined />, color: '#faad14' },
  ];

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>{t('menu.dashboard')}</Title>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {data.map((item, index) => (
          <Col span={6} key={index}>
            <Card bordered={false}>
              <Statistic
                title={item.title}
                value={item.value}
                precision={item.title.includes('SLA') ? 1 : 0}
                valueStyle={{ color: item.color }}
                prefix={item.prefix}
                suffix={item.suffix}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title={t('dashboard.system_health')} bordered={false}>
            <Row gutter={16} align="middle">
              <Col span={12} style={{ textAlign: 'center' }}>
                <Progress type="dashboard" percent={98.5} strokeColor="#52c41a" />
                <div style={{ marginTop: 10 }}>{t('dashboard.overall_health_score')}</div>
              </Col>
              <Col span={12}>
                <List
                  size="small"
                  dataSource={['Network: 99.9%', 'Compute: 98.2%', 'Storage: 100%']}
                  renderItem={(item) => <List.Item>{item}</List.Item>}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={12}>
          <Card title={t('dashboard.recent_activity')} bordered={false}>
            <List
              itemLayout="horizontal"
              dataSource={[
                { title: 'Server-01 CPU High', time: '10 mins ago', type: 'danger' },
                { title: 'New Asset Added: MacBook Pro', time: '2 hours ago', type: 'success' },
                { title: 'User Admin login from new IP', time: '5 hours ago', type: 'warning' },
              ]}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      item.type === 'danger' ? <WarningOutlined style={{ color: 'red' }} /> :
                      item.type === 'warning' ? <WarningOutlined style={{ color: 'orange' }} /> :
                      <CheckCircleOutlined style={{ color: 'green' }} />
                    }
                    title={item.title}
                    description={item.time}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
