import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Typography, List } from 'antd';
import {
  CheckCircleOutlined, WarningOutlined, DesktopOutlined,
  FileTextOutlined, ClockCircleOutlined, ThunderboltOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getDashboardStats, DashboardStats } from '../services/api';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getDashboardStats();
        setStats(result.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      }
    };
    fetchData();
  }, []);

  const slaColor = (stats?.sla_compliance ?? 100) >= 99 ? '#3f8600' : (stats?.sla_compliance ?? 100) >= 95 ? '#faad14' : '#cf1322';

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>{t('menu.dashboard')}</Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="资产总数"
              value={stats?.total_assets ?? 0}
              prefix={<DesktopOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#888' }}>
              在线 {stats?.online_assets ?? 0} / 离线 {stats?.offline_assets ?? 0}
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="合同总数"
              value={stats?.total_contracts ?? 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#888' }}>
              生效中 {stats?.active_contracts ?? 0} / 30天内到期 {stats?.expiring_contracts ?? 0}
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="SLA 合规率"
              value={stats?.sla_compliance ?? 100}
              suffix="%"
              precision={2}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: slaColor }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="告警待处理"
              value={stats?.offline_assets ?? 0}
              prefix={<WarningOutlined />}
              valueStyle={{ color: (stats?.offline_assets ?? 0) > 0 ? '#cf1322' : '#3f8600' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#888' }}>
              离线或维护中的资产
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="系统健康" bordered={false}>
            <List
              size="small"
              dataSource={[
                { label: 'API 服务', status: 'online', desc: 'Workers 运行正常' },
                { label: '数据库', status: 'online', desc: 'D1 连接正常' },
                { label: '存储服务', status: 'online', desc: 'BLOB 存储可用' },
                { label: '认证服务', status: 'online', desc: 'JWT 服务正常' },
              ]}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={item.status === 'online' ? <CheckCircleOutlined style={{ color: 'green' }} /> : <WarningOutlined style={{ color: 'red' }} />}
                    title={item.label}
                    description={item.desc}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="快速操作" bordered={false}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card size="small" hoverable onClick={() => navigate('/assets')}>
                  <Statistic title="资产管理" value="查看" prefix={<DesktopOutlined />} />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" hoverable onClick={() => navigate('/contracts')}>
                  <Statistic title="合同管理" value="查看" prefix={<FileTextOutlined />} />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" hoverable onClick={() => navigate('/import')}>
                  <Statistic title="数据导入" value="导入" prefix={<ThunderboltOutlined />} />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" hoverable onClick={() => navigate('/help')}>
                  <Statistic title="帮助中心" value="查看" prefix={<ClockCircleOutlined />} />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
