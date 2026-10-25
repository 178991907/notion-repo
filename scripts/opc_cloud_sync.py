#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os, sys, json, urllib.request

OPC_TOKEN = os.environ.get("OPC_TOKEN")
BLOG_TOKEN = os.environ.get("BLOG_TOKEN")

ASSETS_DB_ID = "4049622a-6d18-8158-b852-cd8e90147a6d"
BLOG_DB_ID = "d699622a-6d18-82f0-9e68-814c63554113"
NOTION_API_BASE = "https://api.notion.com/v1"

def notion_api(endpoint, payload=None, token="", method="POST"):
    url = f"{NOTION_API_BASE}/{endpoint.lstrip('/')}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
    }
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode("utf-8"))

def get_all(db_id, token):
    items = []
    has_more = True
    start_cursor = None
    while has_more:
        body = {"page_size": 100}
        if start_cursor:
            body["start_cursor"] = start_cursor
        res = notion_api(f"databases/{db_id}/query", body, token=token)
        items.extend(res.get("results", []))
        has_more = res.get("has_more", False)
        start_cursor = res.get("next_cursor")
    return items

def main():
    print("🚀 [GitHub 云端 Runner] 开始执行 OPC ➔ Blog 资产流转巡检...")
    assets = get_all(ASSETS_DB_ID, OPC_TOKEN)
    posts = get_all(BLOG_DB_ID, BLOG_TOKEN)
    
    print(f"云端资产总数: {len(assets)} | 博客文章总数: {len(posts)}")
    post_map = {}
    for p in posts:
        t_list = p.get("properties", {}).get("title", {}).get("title", [])
        title = t_list[0].get("plain_text", "") if t_list else ""
        post_map[title] = p

    for a in assets:
        props = a.get("properties", {})
        t_list = props.get("资产名称", {}).get("title", [])
        asset_name = t_list[0].get("plain_text", "") if t_list else ""
        if not asset_name:
            continue
        channel = props.get("公网发布渠道", {}).get("select", {}).get("name", "内部专属私密")

        matched = None
        for title, p in post_map.items():
            if asset_name in title or ("Semantic" in asset_name and asset_name.split("(")[0].strip() in title):
                matched = p
                break

        if channel in ["Notion Repo 粉丝专区 (/fans)", "Notion Repo 会员专区 (/vip)"]:
            is_vip = "vip" in channel.lower()
            cat = "vip" if is_vip else "fans"
            prefix = "💎【VIP专属】" if is_vip else "🎁【粉丝专享】"
            blog_title = f"{prefix}{asset_name}"

            if matched:
                cur_cat = matched.get("properties", {}).get("category", {}).get("select", {}).get("name", "")
                cur_status = matched.get("properties", {}).get("status", {}).get("select", {}).get("name", "")
                if cur_cat != cat or cur_status != "Published":
                    print(f"🔄 更新博客文章 {blog_title} 为 {cat}...")
                    notion_api(f"pages/{matched['id']}", {
                        "properties": {
                            "category": {"select": {"name": cat}},
                            "status": {"select": {"name": "Published"}},
                            "vip": {"checkbox": is_vip},
                            "fans": {"checkbox": not is_vip}
                        }
                    }, token=BLOG_TOKEN, method="PATCH")
            else:
                print(f"⚡ 自动在博客云端创建新文章: {blog_title}...")
                new_p = notion_api("pages", {
                    "parent": {"database_id": BLOG_DB_ID},
                    "properties": {
                        "title": {"title": [{"text": {"content": blog_title}}]},
                        "category": {"select": {"name": cat}},
                        "status": {"select": {"name": "Published"}},
                        "type": {"select": {"name": "Post"}},
                        "vip": {"checkbox": is_vip},
                        "fans": {"checkbox": not is_vip},
                        "summary": {"rich_text": [{"text": {"content": f"OPC 核心资产：{asset_name}。专供 {cat} 专区取用。"}}]}
                    }
                }, token=BLOG_TOKEN, method="POST")
                print(f"✅ 云端创建成功！ID: {new_p.get('id')}")

    print("🎉 [GitHub 云端 Runner] 资产同步巡检顺利完成！")

if __name__ == "__main__":
    main()
