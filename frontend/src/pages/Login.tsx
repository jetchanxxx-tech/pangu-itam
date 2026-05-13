import React, { useState } from 'react';
import { Card, Input, Button, Form, Typography, message, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

const { Text } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const result = await login(values.username, values.password);
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('username', result.data.username);
      localStorage.setItem('role', result.data.role);
      message.success('登录成功');
      navigate('/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      message.error(msg || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1E1235 0%, #3700B3 50%, #6200EE 100%)',
    }}>
      <Card
        style={{
          width: 420,
          borderRadius: 16,
          boxShadow: '0 24px 80px rgba(98, 0, 238, 0.3)',
          border: '1px solid rgba(187, 134, 252, 0.2)',
        }}
        bodyStyle={{ padding: '40px 32px' }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
          <img
            src="/logo.png"
            alt="Pangu ITAM"
            style={{ width: 180, height: 'auto', marginBottom: 8 }}
          />

          <div>
            <Text style={{ fontSize: 15, color: '#6200EE', fontWeight: 500 }}>
              IT 资产管理系统
            </Text>
          </div>

          <Form onFinish={handleLogin} layout="vertical" size="large">
            <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
              <Input
                prefix={<UserOutlined style={{ color: '#BB86FC' }} />}
                placeholder="用户名"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password
                prefix={<LockOutlined style={{ color: '#BB86FC' }} />}
                placeholder="密码"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{
                  borderRadius: 8,
                  height: 44,
                  background: 'linear-gradient(135deg, #6200EE 0%, #3700B3 100%)',
                  border: 'none',
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                登录
              </Button>
            </Form.Item>
          </Form>

          <div style={{ padding: '12px', background: '#F3E8FF', borderRadius: 8 }}>
            <Text style={{ fontSize: 12, color: '#6200EE' }}>
              默认账户: admin / admin123
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default Login;
