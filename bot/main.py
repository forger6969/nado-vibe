"""
NADO VIBE — Telegram Bot (aiogram 3) + HTTP API (aiohttp)

Endpoints:
  GET  /api/products       → list active products (cached 5 min)
  POST /notify_order       → called by TMA after order, notifies admin in TG

Bot commands:
  /start  → WebApp button (customer)
  /admin  → WebApp button (admin only)
"""

import asyncio
import logging
import os
import time
from typing import Any

import httpx
from aiohttp import web
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BOT_TOKEN = os.environ["BOT_TOKEN"]
ADMIN_CHAT_ID = int(os.environ["ADMIN_CHAT_ID"])
WEBAPP_URL = os.environ["WEBAPP_URL"]
SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_ANON_KEY = os.environ["SUPABASE_ANON_KEY"]
NOTIFY_SECRET = os.environ.get("NOTIFY_SECRET", "")

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

# ── Simple in-memory cache for products ──────────────────────────────────────
_products_cache: list[dict[str, Any]] = []
_cache_ts: float = 0.0
CACHE_TTL = 300  # 5 minutes


async def fetch_products() -> list[dict[str, Any]]:
    global _products_cache, _cache_ts
    if time.time() - _cache_ts < CACHE_TTL and _products_cache:
        return _products_cache
    url = f"{SUPABASE_URL}/rest/v1/products"
    params = {"active": "eq.true", "order": "created_at.desc", "select": "*"}
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
    }
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(url, params=params, headers=headers)
        r.raise_for_status()
        _products_cache = r.json()
        _cache_ts = time.time()
        return _products_cache


# ── Bot commands ──────────────────────────────────────────────────────────────

@dp.message(Command("start"))
async def cmd_start(message: types.Message) -> None:
    kb = InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(
            text="🛍 Открыть магазин",
            web_app=WebAppInfo(url=WEBAPP_URL),
        )
    ]])
    await message.answer(
        "👕 <b>NADO VIBE</b>\n\nМужская одежда — поло, рубашки, брюки, джинсы.\n"
        "Нажми кнопку чтобы открыть каталог:",
        parse_mode="HTML",
        reply_markup=kb,
    )


@dp.message(Command("admin"))
async def cmd_admin(message: types.Message) -> None:
    if not (message.from_user and message.from_user.id == ADMIN_CHAT_ID):
        await message.answer("⛔ Нет доступа.")
        return
    kb = InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(text="⚙️ Панель управления", web_app=WebAppInfo(url=WEBAPP_URL))
    ]])
    await message.answer("Добро пожаловать:", reply_markup=kb)


# ── HTTP handlers ─────────────────────────────────────────────────────────────

async def handle_products(request: web.Request) -> web.Response:
    try:
        products = await fetch_products()
        return web.json_response(products)
    except Exception as e:
        logger.error("fetch_products error: %s", e)
        return web.json_response([], status=502)


async def handle_notify_order(request: web.Request) -> web.Response:
    secret = request.headers.get("X-Notify-Secret", "")
    if NOTIFY_SECRET and secret != NOTIFY_SECRET:
        return web.Response(status=403, text="Forbidden")
    try:
        data = await request.json()
    except Exception:
        return web.Response(status=400, text="Bad JSON")

    oid = data.get("id", "—")
    short_id = str(oid)[:8] if isinstance(oid, str) else str(oid)
    product = data.get("product_name", "—")
    size = data.get("size", "—")
    price = int(data.get("price", 0))
    name = data.get("buyer_name") or "—"
    username = data.get("buyer_username")
    phone = data.get("phone", "—")
    address = data.get("address", "—")
    user_line = f"@{username}" if username else f"TG ID: {data.get('buyer_tg_id', '—')}"

    text = (
        f"🛒 <b>Новый заказ #{short_id}</b>\n\n"
        f"📦 <b>{product}</b> — размер {size}\n"
        f"💰 {price:,} сум\n\n"
        f"👤 {name} ({user_line})\n"
        f"📞 {phone}\n"
        f"📍 {address}"
    )
    try:
        await bot.send_message(ADMIN_CHAT_ID, text, parse_mode="HTML")
    except Exception as e:
        logger.error("Telegram notify error: %s", e)
        return web.Response(status=500, text="Bot error")

    return web.Response(text="OK")


# ── CORS middleware ───────────────────────────────────────────────────────────

@web.middleware
async def cors_middleware(request: web.Request, handler):  # type: ignore[type-arg]
    if request.method == "OPTIONS":
        return web.Response(headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, X-Notify-Secret",
        })
    response = await handler(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response


# ── Entry point ───────────────────────────────────────────────────────────────

async def main() -> None:
    app = web.Application(middlewares=[cors_middleware])
    app.router.add_get("/api/products", handle_products)
    app.router.add_post("/notify_order", handle_notify_order)
    app.router.add_options("/notify_order", lambda _: web.Response())

    runner = web.AppRunner(app)
    await runner.setup()
    port = int(os.environ.get("PORT", 8080))
    await web.TCPSite(runner, "0.0.0.0", port).start()
    logger.info("Server on :%s", port)

    await dp.start_polling(bot, allowed_updates=["message"])


if __name__ == "__main__":
    asyncio.run(main())
