import React from 'react';
import {
  Typography, Card, Collapse, Tabs, Space, Tag, Divider, Table, Timeline,
} from 'antd';
import {
  QuestionCircleOutlined, BookOutlined, ApiOutlined,
  CheckCircleOutlined, InfoCircleOutlined, FileTextOutlined,
  DesktopOutlined, SettingOutlined, DashboardOutlined,
  KeyOutlined,
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const Help: React.FC = () => {
  const faqItems = [
    {
      key: '1',
      label: '如何登录系统？',
      children: (
        <Paragraph>
          访问系统地址，在登录页输入用户名和密码。默认管理员账户：<Text code>admin / admin123</Text>，
          普通用户：<Text code>user / user123</Text>。<br />
          登录成功后会自动跳转到仪表盘页面。Token 有效期 24 小时，过期后需重新登录。
        </Paragraph>
      ),
    },
    {
      key: '2',
      label: '如何新增资产？',
      children: (
        <Paragraph>
          进入「资产管理」页面 → 点击右上角「Add Asset」→ 填写资产信息表单 →
          点击「Create」提交。必填项：名称、类型、IP 地址。可选填：平台、状态、负责人、描述、规格。
        </Paragraph>
      ),
    },
    {
      key: '3',
      label: '合同文件上传有什么限制？',
      children: (
        <Paragraph>
          单个文件最大 <Text strong>10MB</Text>，支持所有常见文件格式（PDF、Word、Excel、图片等）。
          系统自动进行版本管理，同一合同下每次上传版本号自动递增（v1, v2, v3...）。
          如需上传更大文件，请先压缩。
        </Paragraph>
      ),
    },
    {
      key: '4',
      label: '如何下载合同文件？',
      children: (
        <Paragraph>
          在合同列表中找到目标合同 → 点击文件图标 → 在文件列表中点击「Download」按钮。
          浏览器会自动下载文件到本地。
        </Paragraph>
      ),
    },
    {
      key: '5',
      label: '资产状态有哪些？分别代表什么含义？',
      children: (
        <Space direction="vertical">
          <Text><Tag color="green">Online</Tag> — 资产在线，正常运行</Text>
          <Text><Tag color="volcano">Offline</Tag> — 资产离线，不可达</Text>
          <Text><Tag color="geekblue">Maintenance</Tag> — 资产处于维护模式</Text>
        </Space>
      ),
    },
    {
      key: '6',
      label: '合同状态有哪些？',
      children: (
        <Space direction="vertical">
          <Text><Tag>Draft</Tag> — 草稿，尚未生效</Text>
          <Text><Tag color="green">Active</Tag> — 生效中</Text>
          <Text><Tag color="volcano">Expired</Tag> — 已过期</Text>
          <Text><Tag color="red">Terminated</Tag> — 已终止</Text>
        </Space>
      ),
    },
    {
      key: '7',
      label: '如何搜索和筛选？',
      children: (
        <Paragraph>
          在列表页顶部的搜索框输入关键词，按 Enter 或自动触发搜索。搜索范围包括名称、IP、负责人等字段。
          类型筛选下拉框可以按资产类型（Server/VM/Container/Software）过滤结果。
        </Paragraph>
      ),
    },
    {
      key: '8',
      label: '忘记密码怎么办？',
      children: (
        <Paragraph>
          联系系统管理员重置密码。管理员可以通过 API 调用
          <Text code>POST /api/v1/user/change-password</Text> 或直接操作数据库来重置用户密码。
        </Paragraph>
      ),
    },
    {
      key: '9',
      label: '数据如何备份？',
      children: (
        <Paragraph>
          系统数据存储在 Cloudflare D1 数据库中。可以使用以下命令导出数据快照：<br />
          <Text code>npx wrangler d1 export itam-db</Text><br />
          建议定期执行备份并将导出文件保存到安全位置。
        </Paragraph>
      ),
    },
    {
      key: '10',
      label: '系统支持哪些语言？',
      children: (
        <Paragraph>
          系统支持 <Text strong>中文（简体）</Text> 和 <Text strong>English</Text> 两种语言。
          点击右上角语言切换按钮（🇨🇳/🇺🇸）即可切换。
        </Paragraph>
      ),
    },
  ];

  const moduleGuide = [
    {
      key: 'dashboard',
      label: <span><DashboardOutlined /> 仪表盘</span>,
      children: (
        <div>
          <Title level={5}>仪表盘功能</Title>
          <ul>
            <li><Text strong>资产总数</Text>：系统中所有资产的数量统计</li>
            <li><Text strong>UEBA 风险评分</Text>：用户行为分析风险评分（0-100）</li>
            <li><Text strong>活跃告警</Text>：离线或维护状态的资产数量</li>
            <li><Text strong>SLA 合规率</Text>：在线资产占总资产的百分比</li>
            <li><Text strong>待处理审计</Text>：需要审计的项目数量</li>
          </ul>
          <Divider />
          <Text type="secondary">系统健康卡片展示网络、计算、存储各组件的健康评估。</Text>
        </div>
      ),
    },
    {
      key: 'assets',
      label: <span><DesktopOutlined /> 资产管理</span>,
      children: (
        <div>
          <Title level={5}>资产管理操作指南</Title>
          <Timeline
            items={[
              { color: 'green', children: '进入「资产」页面，查看所有资产列表' },
              { color: 'blue', children: '使用搜索框按名称/IP/负责人搜索' },
              { color: 'blue', children: '使用类型筛选下拉框过滤' },
              { color: 'green', children: '点击「Add Asset」新增资产' },
              { color: 'orange', children: '点击编辑图标修改资产信息' },
              { color: 'red', children: '点击删除图标移除资产（需确认）' },
              { color: 'green', children: '切换归档视图查看已归档资产' },
            ]}
          />
          <Divider />
          <Text type="secondary">
            资产支持四种类型：Server（服务器）、VM（虚拟机）、Container（容器）、Software（软件）。
            状态包含 Online、Offline、Maintenance 三种。
          </Text>
        </div>
      ),
    },
    {
      key: 'contracts',
      label: <span><FileTextOutlined /> 合同管理</span>,
      children: (
        <div>
          <Title level={5}>合同管理操作指南</Title>
          <Paragraph>
            合同管理模块支持合同的完整生命周期管理，包括创建、编辑、删除以及文件版本化存储。
          </Paragraph>
          <Space direction="vertical">
            <Text><Tag>procurement</Tag> 采购合同 — 设备或服务采购</Text>
            <Text><Tag>maintenance</Tag> 维保合同 — 设备维护保养</Text>
            <Text><Tag>lease</Tag> 租赁合同 — 设备租赁</Text>
          </Space>
          <Divider />
          <Title level={5}>文件版本管理</Title>
          <Paragraph>
            每个合同可以关联多个文件，系统自动管理版本号。上传新文件时版本号自动递增。
            支持上传、下载和删除文件操作。文件内容存储在 D1 数据库中（BLOB 格式）。
          </Paragraph>
        </div>
      ),
    },
    {
      key: 'interfaces',
      label: <span><ApiOutlined /> 系统接口</span>,
      children: (
        <div>
          <Title level={5}>接口注册中心</Title>
          <Paragraph>
            集中管理所有对外 API 接口的元数据信息。包括接口名称、HTTP 方法、URL 地址、描述和状态。
          </Paragraph>
          <Space direction="vertical">
            <Text><Tag color="green">GET</Tag> 查询操作</Text>
            <Text><Tag color="blue">POST</Tag> 创建操作</Text>
            <Text><Tag color="orange">PUT</Tag> 更新操作</Text>
            <Text><Tag color="red">DELETE</Tag> 删除操作</Text>
            <Text><Tag color="purple">PATCH</Tag> 部分更新</Text>
          </Space>
          <Divider />
          <Text type="secondary">
            状态：<Tag color="green">Active</Tag> 活跃使用中 | <Tag color="volcano">Deprecated</Tag> 已弃用
          </Text>
        </div>
      ),
    },
    {
      key: 'settings',
      label: <span><SettingOutlined /> 系统设置</span>,
      children: (
        <div>
          <Title level={5}>系统设置功能</Title>
          <ul>
            <li><Text strong>基本设置</Text>：系统名称、管理员邮箱、自动发现开关</li>
            <li><Text strong>RBAC 权限</Text>：角色列表和成员管理</li>
            <li><Text strong>审计日志</Text>：操作时间线和变更记录</li>
          </ul>
        </div>
      ),
    },
  ];

  const quickStartSteps = [
    { title: '登录系统', description: '使用默认账户 admin/admin123 登录' },
    { title: '浏览仪表盘', description: '查看系统运营概览和核心指标' },
    { title: '添加资产', description: '进入资产管理，点击 Add Asset 添加第一台服务器' },
    { title: '创建合同', description: '进入合同管理，创建合同并上传相关文件' },
    { title: '注册接口', description: '进入接口管理，注册系统对外的 API 端点' },
  ];

  const apiEndpoints = [
    { method: 'POST', path: '/api/v1/auth/login', desc: '用户登录' },
    { method: 'GET', path: '/api/v1/assets', desc: '资产列表（分页）' },
    { method: 'POST', path: '/api/v1/assets', desc: '创建资产' },
    { method: 'GET', path: '/api/v1/contracts', desc: '合同列表（分页）' },
    { method: 'POST', path: '/api/v1/contracts/:id/files', desc: '上传合同文件' },
    { method: 'GET', path: '/api/v1/contract-files/:id/download', desc: '下载合同文件' },
    { method: 'GET', path: '/api/v1/interfaces', desc: '接口列表（分页）' },
    { method: 'GET', path: '/api/v1/dashboard/stats', desc: '仪表盘统计' },
    { method: 'GET', path: '/health', desc: '健康检查' },
  ];

  const methodColors: Record<string, string> = {
    GET: 'green', POST: 'blue', PUT: 'orange', DELETE: 'red', PATCH: 'purple',
  };

  return (
    <div>
      <Title level={2}>
        <QuestionCircleOutlined /> 帮助中心
      </Title>
      <Divider />

      <Tabs
        defaultActiveKey="guide"
        items={[
          {
            key: 'guide',
            label: <span><BookOutlined /> 功能指南</span>,
            children: (
              <div>
                <Title level={4}>快速入门</Title>
                <Card style={{ marginBottom: 24 }}>
                  <Timeline
                    items={quickStartSteps.map((step, i) => ({
                      color: 'green',
                      children: (
                        <div>
                          <Text strong>{i + 1}. {step.title}</Text>
                          <br />
                          <Text type="secondary">{step.description}</Text>
                        </div>
                      ),
                    }))}
                  />
                </Card>

                <Title level={4}>模块说明</Title>
                <Collapse items={moduleGuide} defaultActiveKey={['dashboard', 'assets']} />
              </div>
            ),
          },
          {
            key: 'faq',
            label: <span><InfoCircleOutlined /> 常见问题 (FAQ)</span>,
            children: (
              <Collapse items={faqItems} accordion />
            ),
          },
          {
            key: 'api',
            label: <span><ApiOutlined /> API 参考</span>,
            children: (
              <div>
                <Title level={4}>API 端点列表</Title>
                <Paragraph>
                  所有 API 端点前缀：<Text code>/api/v1</Text>
                </Paragraph>
                <Table
                  dataSource={apiEndpoints.map((e, i) => ({ ...e, key: i }))}
                  columns={[
                    {
                      title: '方法',
                      dataIndex: 'method',
                      key: 'method',
                      width: 90,
                      render: (m: string) => <Tag color={methodColors[m]}>{m}</Tag>,
                    },
                    {
                      title: '路径',
                      dataIndex: 'path',
                      key: 'path',
                      render: (p: string) => <Text code>{p}</Text>,
                    },
                    { title: '说明', dataIndex: 'desc', key: 'desc' },
                  ]}
                  pagination={false}
                  size="small"
                />
                <Divider />
                <Title level={5}>认证方式</Title>
                <Paragraph>
                  所有受保护的 API 端点需要在请求头中携带 JWT Token：<br />
                  <Text code>Authorization: Bearer &lt;token&gt;</Text>
                </Paragraph>
                <Title level={5}>响应格式</Title>
                <Paragraph>
                  统一响应格式：<Text code>{'{ "ok": true, "data": { ... } }'}</Text><br />
                  分页响应：<Text code>{'{ "ok": true, "data": [...], "pagination": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 } }'}</Text><br />
                  错误响应：<Text code>{'{ "ok": false, "error": { "code": "ERROR_CODE", "message": "..." } }'}</Text>
                </Paragraph>
              </div>
            ),
          },
          {
            key: 'shortcuts',
            label: <span><KeyOutlined /> 快捷操作</span>,
            children: (
              <div>
                <Title level={4}>键盘快捷键</Title>
                <Table
                  dataSource={[
                    { key: '1', shortcut: 'Enter', action: '提交搜索' },
                    { key: '2', shortcut: 'Esc', action: '关闭弹窗/模态框' },
                    { key: '3', shortcut: 'Tab', action: '切换表单字段焦点' },
                  ]}
                  columns={[
                    { title: '快捷键', dataIndex: 'shortcut', key: 'shortcut', render: (s: string) => <Tag>{s}</Tag> },
                    { title: '功能', dataIndex: 'action', key: 'action' },
                  ]}
                  pagination={false}
                  size="small"
                />
                <Divider />
                <Title level={4}>系统信息</Title>
                <Space direction="vertical">
                  <Text><CheckCircleOutlined style={{ color: 'green' }} /> 后端框架：Hono (Cloudflare Workers)</Text>
                  <Text><CheckCircleOutlined style={{ color: 'green' }} /> 前端框架：React 18 + Ant Design 5</Text>
                  <Text><CheckCircleOutlined style={{ color: 'green' }} /> 数据库：Cloudflare D1 (SQLite 兼容)</Text>
                  <Text><CheckCircleOutlined style={{ color: 'green' }} /> 认证：JWT (HMAC-SHA256, Web Crypto API)</Text>
                  <Text><CheckCircleOutlined style={{ color: 'green' }} /> 存储：D1 BLOB (文件 ≤ 10MB)</Text>
                  <Text><CheckCircleOutlined style={{ color: 'green' }} /> 国际化：中文 / English</Text>
                </Space>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};

export default Help;
