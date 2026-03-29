#!/usr/bin/env python3
"""
查询后端微服务的 OpenAPI 接口文档

Usage:
    python query_api_docs.py [--services user,ticket,order,stock] [--paths /login,/concerts]
"""

import argparse
import json
import subprocess
import sys
from typing import Optional
from urllib.parse import urlparse

# 服务配置
SERVICES = {
    "user": {
        "port": 8081,
        "url": "http://localhost:8081/users/v3/api-docs",
        "description": "用户服务",
    },
    "ticket": {
        "port": 8080,
        "url": "http://localhost:8080/ticket/v3/api-docs",
        "description": "演唱会服务",
    },
    "order": {
        "port": 8082,
        "url": "http://localhost:8082/order/v3/api-docs",
        "description": "订单服务",
    },
    "stock": {
        "port": 8083,
        "url": "http://localhost:8083/stock/v3/api-docs",
        "description": "库存服务",
    },
}


def fetch_openapi(url: str) -> Optional[dict]:
    """获取 OpenAPI 文档"""
    try:
        result = subprocess.run(
            ["curl", "-s", url],
            capture_output=True,
            text=True,
            timeout=10,
        )
        if result.returncode == 0:
            return json.loads(result.stdout)
    except Exception as e:
        print(f"获取 {url} 失败: {e}", file=sys.stderr)
    return None


def match_path(path: str, patterns: list[str]) -> bool:
    """检查路径是否匹配任意模式"""
    if not patterns:
        return True
    path_lower = path.lower()
    for pattern in patterns:
        pattern_lower = pattern.lower()
        if pattern_lower in path_lower:
            return True
    return False


def format_schema(schema: dict, indent: int = 0) -> str:
    """格式化 schema"""
    if not schema:
        return "无"

    indent_str = "  " * indent
    result = []

    schema_type = schema.get("type", "object")
    result.append(f"{indent_str}类型: {schema_type}")

    if "properties" in schema:
        result.append(f"{indent_str}属性:")
        for name, prop in schema["properties"].items():
            prop_type = prop.get("type", "any")
            required = name in schema.get("required", [])
            req_mark = "*" if required else ""
            result.append(f"{indent_str}  - {name}{req_mark}: {prop_type}")
            if prop_type == "object" and "properties" in prop:
                result.append(format_schema(prop, indent + 2))

    if "items" in schema:
        result.append(f"{indent_str}数组项:")
        result.append(format_schema(schema["items"], indent + 1))

    return "\n".join(result)


def format_endpoint(method: str, path: str, info: dict, schemas: dict) -> str:
    """格式化单个接口信息"""
    lines = []
    lines.append(f"\n### {method.upper()} {path}")

    # 描述
    summary = info.get("summary", "")
    operation_id = info.get("operationId", "")
    if summary:
        lines.append(f"**描述**: {summary}")
    elif operation_id:
        lines.append(f"**操作**: {operation_id}")

    # 请求参数
    params = info.get("parameters", [])
    if params:
        lines.append("\n**请求参数**:")
        for param in params:
            location = param.get("in", "query")
            name = param.get("name", "?")
            required = param.get("required", False)
            req_mark = "*" if required else ""
            schema = param.get("schema", {})
            param_type = schema.get("type", "any")
            lines.append(f"  - [{location}] {name}{req_mark}: {param_type}")

    # 请求体
    request_body = info.get("requestBody", {})
    if request_body:
        lines.append("\n**请求体**:")
        content = request_body.get("content", {})
        for content_type, content_info in content.items():
            if "schema" in content_info:
                schema_ref = content_info["schema"]
                if "$ref" in schema_ref:
                    ref_name = schema_ref["$ref"].split("/")[-1]
                    if ref_name in schemas:
                        lines.append(format_schema(schemas[ref_name], 1))
                else:
                    lines.append(format_schema(schema_ref, 1))

    # 响应
    responses = info.get("responses", {})
    if responses:
        lines.append("\n**响应**:")
        for status, response_info in responses.items():
            if status.startswith("2"):  # 只显示成功响应
                content = response_info.get("content", {})
                for content_type, content_info in content.items():
                    if "schema" in content_info:
                        schema_ref = content_info["schema"]
                        if "$ref" in schema_ref:
                            ref_name = schema_ref["$ref"].split("/")[-1]
                            if ref_name in schemas:
                                lines.append(format_schema(schemas[ref_name], 1))
                        else:
                            lines.append(format_schema(schema_ref, 1))

    return "\n".join(lines)


def query_service(service_name: str, path_patterns: list[str]) -> str:
    """查询单个服务的接口"""
    if service_name not in SERVICES:
        return f"未知服务: {service_name}"

    config = SERVICES[service_name]
    openapi = fetch_openapi(config["url"])

    if not openapi:
        return f"无法获取 {service_name} 服务的 API 文档"

    results = [f"\n## {service_name} 服务 ({config['description']})"]

    paths = openapi.get("paths", {})
    schemas = openapi.get("components", {}).get("schemas", {})

    matched_count = 0
    for path, methods in paths.items():
        if not match_path(path, path_patterns):
            continue

        for method, info in methods.items():
            if method in ["get", "post", "put", "delete", "patch"]:
                results.append(format_endpoint(method, path, info, schemas))
                matched_count += 1

    if matched_count == 0:
        results.append("\n未找到匹配的接口")
    else:
        results.append(f"\n共 {matched_count} 个接口")

    return "\n".join(results)


def main():
    parser = argparse.ArgumentParser(description="查询后端 API 文档")
    parser.add_argument(
        "--services", "-s",
        help="要查询的服务列表，逗号分隔 (user,ticket,order,stock)，不传则查询所有",
    )
    parser.add_argument(
        "--paths", "-p",
        help="要查询的接口路径，逗号分隔，支持模糊匹配",
    )

    args = parser.parse_args()

    # 解析参数
    if args.services:
        service_list = [s.strip().lower() for s in args.services.split(",")]
    else:
        service_list = list(SERVICES.keys())

    path_patterns = []
    if args.paths:
        path_patterns = [p.strip().lower() for p in args.paths.split(",")]

    # 执行查询
    print("# 后端 API 文档查询结果")
    print(f"服务: {', '.join(service_list)}")
    if path_patterns:
        print(f"路径筛选: {', '.join(path_patterns)}")

    for service in service_list:
        result = query_service(service, path_patterns)
        print(result)


if __name__ == "__main__":
    main()
