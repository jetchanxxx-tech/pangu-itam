import React, { useState, useEffect } from 'react';
import {
  Layout, Menu, Typography, Card, Tag, Input, Button, List, Modal, Form, Select,
  message, Popconfirm, Space, Empty,
} from 'antd';
import {
  ReadOutlined, FileTextOutlined, EditOutlined, PlusOutlined,
  DeleteOutlined, SearchOutlined, FolderOutlined,
} from '@ant-design/icons';
import {
  getWikiArticles, getWikiArticle, createWikiArticle,
  updateWikiArticle, deleteWikiArticle, getWikiCategories,
  WikiArticle,
} from '../services/api';

const { Title, Paragraph, Text } = Typography;
const { Sider, Content } = Layout;

const Wiki: React.FC = () => {
  const [articles, setArticles] = useState<WikiArticle[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<WikiArticle | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<WikiArticle | null>(null);
  const [form] = Form.useForm();

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await getWikiArticles({
        search: searchText || undefined,
        category: selectedCategory || undefined,
      });
      setArticles(res.data);
    } catch {
      message.error('加载文章失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await getWikiCategories();
      setCategories(res.data);
    } catch { /* ignore */ }
  };

  useEffect(() => { fetchArticles(); }, [searchText, selectedCategory]);
  useEffect(() => { fetchCategories(); }, []);

  const handleSelectArticle = async (id: number) => {
    try {
      const res = await getWikiArticle(id);
      setSelectedArticle(res.data);
    } catch {
      message.error('加载文章详情失败');
    }
  };

  const handleSave = async (values: Record<string, unknown>) => {
    try {
      if (editingArticle) {
        await updateWikiArticle(editingArticle.id, values as Partial<WikiArticle>);
        message.success('文章已更新');
        if (selectedArticle?.id === editingArticle.id) {
          setSelectedArticle({ ...editingArticle, ...values } as WikiArticle);
        }
      } else {
        await createWikiArticle(values as Partial<WikiArticle>);
        message.success('文章已创建');
      }
      setModalOpen(false);
      setEditingArticle(null);
      form.resetFields();
      fetchArticles();
      fetchCategories();
    } catch {
      message.error('操作失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteWikiArticle(id);
      message.success('文章已删除');
      if (selectedArticle?.id === id) setSelectedArticle(null);
      fetchArticles();
      fetchCategories();
    } catch {
      message.error('删除失败');
    }
  };

  const openCreate = () => {
    setEditingArticle(null);
    form.resetFields();
    form.setFieldsValue({ category: selectedCategory });
    setModalOpen(true);
  };

  const openEdit = (article: WikiArticle) => {
    setEditingArticle(article);
    form.setFieldsValue(article);
    setModalOpen(true);
  };

  return (
    <Layout style={{ background: 'transparent', minHeight: 500 }}>
      <Sider width={240} style={{ background: 'transparent', marginRight: 16 }}>
        <div style={{ marginBottom: 16 }}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="搜索文章..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
          />
        </div>
        <Menu
          mode="inline"
          selectedKeys={selectedCategory ? [selectedCategory] : ['all']}
          style={{ background: 'transparent' }}
          items={[
            { key: 'all', icon: <ReadOutlined />, label: `全部 (${articles.length})` },
            ...categories.map(c => ({
              key: c,
              icon: <FolderOutlined />,
              label: c,
            })),
          ]}
          onClick={({ key }) => setSelectedCategory(key === 'all' ? '' : key)}
        />
        <div style={{ marginTop: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} block onClick={openCreate}>
            新建文章
          </Button>
        </div>
      </Sider>

      <Content>
        {selectedArticle ? (
          <Card
            title={<Title level={4} style={{ margin: 0 }}>{selectedArticle.title}</Title>}
            extra={
              <Space>
                <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(selectedArticle)}>编辑</Button>
                <Popconfirm title="确定删除此文章？" onConfirm={() => handleDelete(selectedArticle.id)}>
                  <Button danger icon={<DeleteOutlined />} size="small">删除</Button>
                </Popconfirm>
              </Space>
            }
          >
            <Space style={{ marginBottom: 16 }}>
              {selectedArticle.category && <Tag color="blue">{selectedArticle.category}</Tag>}
              {selectedArticle.tags?.split(',').filter(Boolean).map((tag: string) => (
                <Tag key={tag}>{tag.trim()}</Tag>
              ))}
            </Space>
            <Paragraph style={{ whiteSpace: 'pre-wrap', lineHeight: 2 }}>
              {selectedArticle.content || '（无内容）'}
            </Paragraph>
            <div style={{ marginTop: 24, color: '#888', fontSize: 12 }}>
              创建于 {selectedArticle.created_at} · 更新于 {selectedArticle.updated_at}
            </div>
          </Card>
        ) : (
          <Card>
            {articles.length === 0 ? (
              <Empty description="暂无文章，点击左侧「新建文章」创建" />
            ) : (
              <List
                loading={loading}
                dataSource={articles}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button icon={<EditOutlined />} size="small" onClick={(e) => { e.stopPropagation(); openEdit(item); }} />,
                      <Popconfirm title="确定删除？" onConfirm={(e) => { e?.stopPropagation(); handleDelete(item.id); }}>
                        <Button danger icon={<DeleteOutlined />} size="small" onClick={(e) => e.stopPropagation()} />
                      </Popconfirm>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<FileTextOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                      title={
                        <a onClick={() => handleSelectArticle(item.id)}>
                          {item.title}
                        </a>
                      }
                      description={
                        <Space>
                          {item.category && <Tag color="blue">{item.category}</Tag>}
                          <Text type="secondary">{item.updated_at}</Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        )}
      </Content>

      <Modal
        title={editingArticle ? '编辑文章' : '新建文章'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditingArticle(null); form.resetFields(); }}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="文章标题" />
          </Form.Item>
          <Form.Item name="category" label="分类">
            <Select
              placeholder="选择或输入分类"
              allowClear
              mode="tags"
              maxCount={1}
              options={categories.map(c => ({ label: c, value: c }))}
            />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Select
              placeholder="输入标签（逗号分隔）"
              mode="tags"
              tokenSeparators={[',']}
            />
          </Form.Item>
          <Form.Item name="content" label="内容">
            <Input.TextArea rows={12} placeholder="文章内容..." />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingArticle ? '更新' : '创建'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default Wiki;
