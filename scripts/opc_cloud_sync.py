#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
OPC ➔ Blog 云端自动化巡检与流转引擎 (scripts/opc_cloud_sync.py)
托管于 GitHub Actions 微软全球云端 Runner，零本地电脑依赖。
"""

import os
import sys
import json
import re
import urllib.request
from typing import Any, Dict, List, Optional

OPC_TOKEN = os.environ.get("OPC_TOKEN")
BLOG_TOKEN = os.environ.get("BLOG_TOKEN")

ASSETS_DB_ID = "4049622a-6d18-8158-b852-cd8e90147a6d"
BLOG_DB_ID = "d699622a-6d18-82f0-9e68-814c63554113"
NOTION_API_BASE = "https://api.notion.com/v1"
NOTION_VERSION = "2022-06-28"


def notion_api(endpoint: str, payload: Optional[Dict[str, Any]] = None, token: str = "", method: str = "POST") -> Dict[str, Any]:
    url = f"{NOTION_API_BASE}/{endpoint.lstrip('/')}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
    }
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode("utf-8"))


def get_all(db_id: str, token: str) -> List[Dict[str, Any]]:
    items = []
    has_more = True
    start_cursor = None
    while has_more:
        body: Dict[str, Any] = {"page_size": 100}
        if start_cursor:
            body["start_cursor"] = start_cursor
        res = notion_api(f"databases/{db_id}/query", body, token=token)
        items.extend(res.get("results", []))
        has_more = res.get("has_more", False)
        start_cursor = res.get("next_cursor")
    return items


def extract_core_asset_key(name: str) -> str:
    if "Semantic" in name:
        match = re.search(r"Semantic\w+", name)
        if match:
            return match.group(0)
    clean = name.replace(".pdf", "").replace("（高清版）", "").replace("（高清A4可打印版）", "").strip()
    return clean


def find_matching_blog_post(asset_name: str, blog_posts: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    core_key = extract_core_asset_key(asset_name)
    is_semantic = "Semantic" in asset_name

    for p in blog_posts:
        props = p.get("properties", {})
        t_list = props.get("title", {}).get("title", [])
        title = t_list[0].get("plain_text", "") if t_list else ""
        slug_list = props.get("slug", {}).get("rich_text", [])
        slug = slug_list[0].get("plain_text", "") if slug_list else ""

        if is_semantic:
            if core_key and (core_key in title or core_key.lower() in slug.lower()):
                return p
        else:
            if "50首磨耳朵" in asset_name and "50首磨耳朵" in title:
                return p
            if "自然拼读积木练习纸" in asset_name and "自然拼读" in title:
                return p
            if "私域引流承接SOP" in asset_name and "福利领取" in title:
                return p
            if core_key and (core_key in title or core_key.lower() in slug.lower()):
                return p
    return None


def main():
    print("🚀 [GitHub 云端 Runner] 开始执行 OPC ➔ Blog 资产流转巡检...")
    assets = get_all(ASSETS_DB_ID, OPC_TOKEN)
    blog_posts = get_all(BLOG_DB_ID, BLOG_TOKEN)
    print(f"云端资产总数: {len(assets)} | 博客文章总数: {len(blog_posts)}")

    for a in assets:
        props = a.get("properties", {})
        t_list = props.get("资产名称", {}).get("title", [])
        asset_name = t_list[0].get("plain_text", "") if t_list else ""
        if not asset_name:
            continue

        pub_select = props.get("公网发布渠道", {}).get("select", {})
        channel = pub_select.get("name") if pub_select else "内部专属私密"

        matched = find_matching_blog_post(asset_name, blog_posts)

        if channel in ["Notion Repo 粉丝专区 (/fans)", "Notion Repo 会员专区 (/vip)"]:
            is_vip = "vip" in channel.lower()
            target_cat = "vip" if is_vip else "fans"
            prefix = "💎【VIP专属】" if is_vip else "🎁【粉丝专享】"
            blog_title = f"{prefix}{asset_name}"

            if matched:
                post_id = matched["id"]
                p_props = matched.get("properties", {})
                cur_cat = p_props.get("category", {}).get("select", {}).get("name", "")
                cur_status = p_props.get("status", {}).get("select", {}).get("name", "")
                cur_vip = p_props.get("vip", {}).get("checkbox", False)
                cur_fans = p_props.get("fans", {}).get("checkbox", False)

                need_update = (cur_cat != target_cat or cur_status != "Published" or 
                               cur_vip != is_vip or cur_fans != (not is_vip))
                if need_update:
                    print(f"🔄 更新博客文章 {post_id} 为 {target_cat}...")
                    notion_api(f"pages/{post_id}", {
                        "properties": {
                            "category": {"select": {"name": target_cat}},
                            "status": {"select": {"name": "Published"}},
                            "type": {"select": {"name": "Post"}},
                            "vip": {"checkbox": is_vip},
                            "fans": {"checkbox": not is_vip}
                        }
                    }, token=BLOG_TOKEN, method="PATCH")
                    print(f"✅ 属性更新完成！")
            else:
                print(f"⚡ 自动在博客云端创建新文章: {blog_title}...")
                new_p = notion_api("pages", {
                    "parent": {"database_id": BLOG_DB_ID},
                    "properties": {
                        "title": {"title": [{"text": {"content": blog_title}}]},
                        "category": {"select": {"name": target_cat}},
                        "status": {"select": {"name": "Published"}},
                        "type": {"select": {"name": "Post"}},
                        "vip": {"checkbox": is_vip},
                        "fans": {"checkbox": not is_vip},
                        "summary": {"rich_text": [{"text": {"content": f"OPC 核心资产：{asset_name}。专供 {target_cat} 专区取用。"}}]}
                    }
                }, token=BLOG_TOKEN, method="POST")
                print(f"✅ 云端创建成功！ID: {new_p.get('id')}")

        elif channel == "内部专属私密" and matched:
            post_id = matched["id"]
            p_props = matched.get("properties", {})
            cur_status = p_props.get("status", {}).get("select", {}).get("name", "")
            t_list = p_props.get("title", {}).get("title", [])
            p_title = t_list[0].get("plain_text", "") if t_list else ""
            if cur_status == "Published" and ("Semantic" in p_title or "【源码组件】" in p_title):
                print(f"🔒 资产 [{asset_name}] 改为私密 -> 将博客文章 {p_title} 设为 Invisible 隐形...")
                notion_api(f"pages/{post_id}", {"properties": {"status": {"select": {"name": "Invisible"}}}}, token=BLOG_TOKEN, method="PATCH")

    print("🎉 [GitHub 云端 Runner] 资产同步巡检顺利完成！")


if __name__ == "__main__":
    main()
