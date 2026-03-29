---
name: backend-api-query
description: 查询后端微服务的 OpenAPI 接口文档。当用户需要查询 API 接口信息、了解接口路径、请求参数、响应格式时使用此 skill。支持指定服务和接口路径进行精确查询。当用户提到"查询接口"、"API文档"、"接口路径"、"请求参数"、"后端接口"时触发此 skill。
---

# 后端 API 文档查询

查询票务预订系统后端微服务的 OpenAPI 接口文档。

## ⚠️ 重要：网关路由规则

**所有前端请求必须加 `/api` 前缀！**

网关配置了 `StripPrefix=1`，会剥离第一层路径：

| 前端请求路径 | 网关转发到微服务 | 后端实际路径 |
|-------------|------------------|-------------|
| `/api/users/login` | 用户服务 | `/users/login` |
| `/api/ticket/concerts` | 演唱会服务 | `/ticket/concerts` |
| `/api/order/book` | 订单服务 | `/order/book` |
| `/api/stock/{id}` | 库存服务 | `/stock/{id}` |

**常见错误**: 直接使用 OpenAPI 文档中的路径（如 `/users/login`），忘记加 `/api` 前缀，导致 404。

**正确做法**: OpenAPI 文档显示的路径是后端内部路径，前端调用时需要加上 `/api` 前缀。

## 服务列表

| 服务名 | 端口 | OpenAPI 路径 (直接访问微服务) |
|--------|------|------------------------------|
| user | 8081 | http://localhost:8081/users/v3/api-docs |
| ticket | 8080 | http://localhost:8080/ticket/v3/api-docs |
| order | 8082 | http://localhost:8082/order/v3/api-docs |
| stock | 8083 | http://localhost:8083/stock/v3/api-docs |

**注意**: OpenAPI 文档需要直接请求微服务端口，不能走网关。

## 执行命令

使用脚本查询:

```bash
python .claude/skills/backend-api-query/scripts/query_api_docs.py [--services user,ticket,order,stock] [--paths /login,/concerts]
```

### 参数说明

- `--services` / `-s`: 要查询的服务列表，逗号分隔
  - 可选值: `user`, `ticket`, `order`, `stock`
  - 不传则查询所有服务

- `--paths` / `-p`: 要查询的接口路径，支持模糊匹配
  - 不传则返回该服务所有接口
  - 示例: `--paths /login,/admin`

## 直接 curl 查询

如果脚本不可用，可以直接 curl 获取原始 OpenAPI 文档:

```bash
# 用户服务 (注意：直接访问微服务端口 8081，不走网关)
curl -s http://localhost:8081/users/v3/api-docs | jq '.'

# 演唱会服务
curl -s http://localhost:8080/ticket/v3/api-docs | jq '.'

# 订单服务
curl -s http://localhost:8082/order/v3/api-docs | jq '.'

# 库存服务
curl -s http://localhost:8083/stock/v3/api-docs | jq '.'
```

## 前端调用示例

查询到 OpenAPI 文档后，前端调用时需要加 `/api` 前缀：

```
OpenAPI 显示: POST /users/login
前端调用:    POST /api/users/login  ← 加上 /api 前缀
```

## 示例用法

用户可能的表达方式:

- "查询后端 API 文档" → 查询所有服务
- "查询 user 服务的接口" → `--services user`
- "查询 /login 接口" → `--paths /login`
- "查询 ticket 服务的 /admin 接口" → `--services ticket --paths /admin`
- "查询用户和订单服务的接口" → `--services user,order`
