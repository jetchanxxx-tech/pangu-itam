-- =============================================================================
-- 软件系统资产管理平台 (ITAM) 数据库 Schema
-- Database: PostgreSQL
-- Design Philosophy: Multi-tenancy, Modular Monolith, EAV via JSONB
-- =============================================================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. 多租户与组织架构 (Tenancy & Org Hierarchy)
-- =============================================================================

-- 租户表：最高层级的物理隔离单位（如不同的集团客户）
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    subscription_type VARCHAR(20) DEFAULT 'community',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 组织架构表：支持无限层级 (集团 -> 区域公司 -> 分公司 -> 部门)
-- 采用 Materialized Path (path字段) 优化树形查询
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    parent_id UUID REFERENCES organizations(id), -- 根节点的 parent_id 为空
    
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50), -- 部门/公司代码
    type VARCHAR(20) NOT NULL, -- 'group', 'company', 'department', 'team'
    
    -- 核心：层级路径，格式如 "/root_uuid/sub_uuid/"
    -- 查询某节点下所有资产：WHERE path LIKE '/root_uuid/%'
    tree_path TEXT NOT NULL, 
    level INT NOT NULL DEFAULT 1,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 建立索引加速层级查询
CREATE INDEX idx_org_tree_path ON organizations(tree_path text_pattern_ops);
CREATE INDEX idx_org_tenant_parent ON organizations(tenant_id, parent_id);

-- 角色表：定义功能权限集合
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id),
    name VARCHAR(50) NOT NULL,
    permissions JSONB NOT NULL DEFAULT '[]', 
    -- 数据范围策略：'self' (仅自己), 'department' (本部门), 'company' (本公司及下级), 'all' (全租户)
    data_scope_type VARCHAR(20) DEFAULT 'department', 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    org_id UUID REFERENCES organizations(id), -- 用户归属的部门/公司
    
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id UUID REFERENCES roles(id),
    
    -- 资源组标签 (用于跨部门的虚拟项目组)
    resource_group_tags JSONB DEFAULT '[]', 
    
    -- 风控字段
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_login_ip VARCHAR(45),
    is_locked BOOLEAN DEFAULT FALSE,
    risk_score INT DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, username),
    UNIQUE(tenant_id, email)
);

-- =============================================================================
-- 2. 资产核心 (Core Assets)
-- =============================================================================

-- 资产表
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    org_id UUID REFERENCES organizations(id), -- 资产归属的部门/公司


-- 资产关系表：构建拓扑图
CREATE TABLE asset_relations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    
    source_asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    target_asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    relation_type VARCHAR(50) NOT NULL, -- 'runs_on', 'connects_to', 'depends_on', 'manages'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(source_asset_id, target_asset_id, relation_type)
);

-- 建立索引以加速图查询
CREATE INDEX idx_asset_relations_source ON asset_relations(source_asset_id);
CREATE INDEX idx_asset_relations_target ON asset_relations(target_asset_id);
CREATE INDEX idx_assets_properties ON assets USING gin (properties); -- 加速 JSON 搜索

-- =============================================================================
-- 3. 运维与风控 (Ops & Risk)
-- =============================================================================

-- 审计日志表：记录所有变更与敏感操作
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID REFERENCES users(id), -- 如果是系统自动操作，可为空
    
    action VARCHAR(100) NOT NULL, -- 'asset.create', 'ssh.connect', 'password.view'
    target_asset_id UUID,
    
    -- 变更详情
    changes JSONB, -- { "old": ..., "new": ... }
    client_ip VARCHAR(45),
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 风险事件表：记录触发风控的事件
CREATE TABLE risk_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    
    risk_type VARCHAR(50) NOT NULL, -- 'user_behavior', 'sla_violation'
    severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    score_impact INT NOT NULL, -- 扣分值或增加的风险分
    
    target_type VARCHAR(50) NOT NULL, -- 'user', 'asset'
    target_id UUID NOT NULL,
    
    description TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Wiki/知识库关联表
CREATE TABLE asset_wikis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    
    content TEXT, -- Markdown 内容
    
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
