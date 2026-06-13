"""
NADO VIBE — Courier Bot (aiogram 3)

Env vars needed (Render separate service):
  COURIER_BOT_TOKEN   — token from @BotFather
  SUPABASE_URL        — same as main bot
  SUPABASE_SERVICE_KEY — Supabase service_role key (full access)

Commands:
  /start        — register as courier (asks for phone)
  /deliveries   — list active (shipped) deliveries
  /done         — same as tapping the confirm button

Inline button: "✅ Подтвердить доставку" per cart group
"""

import asyncio
import logging
import os

import httpx
from aiogram import Bot, Dispatcher, F, types
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

COURIER_BOT_TOKEN = os.environ["COURIER_BOT_TOKEN"]
SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]

bot = Bot(token=COURIER_BOT_TOKEN)
dp = Dispatcher(storage=MemoryStorage())

SB = {
    "apikey": SUPABASE_SERVICE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}


class Reg(StatesGroup):
    phone = State()


# ── Supabase helpers ──────────────────────────────────────────────────────────

async def get_courier(tg_id: int) -> dict | None:
    async with httpx.AsyncClient(timeout=10) as c:
        r = await c.get(f"{SUPABASE_URL}/rest/v1/couriers",
                        params={"tg_id": f"eq.{tg_id}", "select": "*"}, headers=SB)
        data = r.json()
        return data[0] if data else None


async def save_courier(tg_id: int, name: str, phone: str) -> bool:
    async with httpx.AsyncClient(timeout=10) as c:
        r = await c.post(
            f"{SUPABASE_URL}/rest/v1/couriers",
            json={"tg_id": tg_id, "name": name, "phone": phone},
            headers={**SB, "Prefer": "resolution=merge-duplicates,return=representation"},
        )
        return r.status_code in (200, 201)


async def get_deliveries(phone: str) -> list[dict]:
    async with httpx.AsyncClient(timeout=10) as c:
        r = await c.get(
            f"{SUPABASE_URL}/rest/v1/orders",
            params={
                "courier_phone": f"eq.{phone}",
                "status": "eq.shipped",
                "select": "id,product_name,size,qty,address,phone,buyer_name,cart_id",
                "order": "created_at.asc",
            },
            headers=SB,
        )
        return r.json() if r.status_code == 200 else []


async def mark_cart_delivered(cart_id: str) -> bool:
    async with httpx.AsyncClient(timeout=10) as c:
        r = await c.patch(
            f"{SUPABASE_URL}/rest/v1/orders",
            params={"cart_id": f"eq.{cart_id}", "status": "eq.shipped"},
            json={"status": "delivered"},
            headers={**SB, "Prefer": ""},
        )
        return r.status_code in (200, 204)


# ── Bot handlers ──────────────────────────────────────────────────────────────

@dp.message(Command("start"))
async def cmd_start(message: types.Message, state: FSMContext) -> None:
    courier = await get_courier(message.from_user.id)
    if courier:
        await message.answer(
            f"👋 Привет, <b>{courier['name']}</b>!\n\n"
            "/deliveries — активные доставки\n"
            "/start — обновить данные",
            parse_mode="HTML",
        )
        return
    await message.answer(
        "👕 <b>NADO VIBE — Система курьеров</b>\n\n"
        "Отправь свой номер телефона для регистрации:\n"
        "<code>+998901234567</code>",
        parse_mode="HTML",
    )
    await state.set_state(Reg.phone)


@dp.message(Reg.phone)
async def reg_phone(message: types.Message, state: FSMContext) -> None:
    raw = (message.text or "").strip()
    digits = "".join(c for c in raw if c.isdigit())
    if len(digits) < 9:
        await message.answer("❌ Неверный формат. Попробуй ещё раз: +998901234567")
        return
    name = message.from_user.full_name or f"Курьер {message.from_user.id}"
    ok = await save_courier(message.from_user.id, name, raw)
    await state.clear()
    if ok:
        await message.answer(
            f"✅ <b>Зарегистрирован!</b>\n\n"
            f"Имя: {name}\nТелефон: {raw}\n\n"
            "Теперь /deliveries чтобы видеть доставки.",
            parse_mode="HTML",
        )
    else:
        await message.answer("❌ Ошибка. Попробуй /start снова.")


@dp.message(Command("deliveries"))
async def cmd_deliveries(message: types.Message) -> None:
    courier = await get_courier(message.from_user.id)
    if not courier:
        await message.answer("Ты не зарегистрирован. Напиши /start")
        return

    deliveries = await get_deliveries(courier["phone"])
    if not deliveries:
        await message.answer("📭 <b>Нет активных доставок</b>", parse_mode="HTML")
        return

    # Group by cart_id
    carts: dict[str, list[dict]] = {}
    for d in deliveries:
        key = d.get("cart_id") or d["id"]
        carts.setdefault(key, []).append(d)

    await message.answer(f"🚚 <b>Активных доставок: {len(carts)}</b>", parse_mode="HTML")

    for cart_id, items in carts.items():
        first = items[0]
        tag = "#" + cart_id[:6].upper()
        items_text = "\n".join(
            f"  • {i['product_name']} ({i['size']}) × {i.get('qty') or 1}"
            for i in items
        )
        text = (
            f"📦 <b>Заказ {tag}</b>\n\n"
            f"{items_text}\n\n"
            f"👤 {first.get('buyer_name') or '—'}\n"
            f"📞 <code>{first['phone']}</code>\n"
            f"📍 {first['address']}"
        )
        kb = InlineKeyboardMarkup(inline_keyboard=[[
            InlineKeyboardButton(
                text="✅ Подтвердить доставку",
                callback_data=f"deliver:{cart_id}",
            )
        ]])
        await message.answer(text, parse_mode="HTML", reply_markup=kb)


@dp.callback_query(F.data.startswith("deliver:"))
async def cb_deliver(callback: types.CallbackQuery) -> None:
    cart_id = callback.data.split(":", 1)[1]
    courier = await get_courier(callback.from_user.id)
    if not courier:
        await callback.answer("❌ Ты не зарегистрирован.")
        return

    ok = await mark_cart_delivered(cart_id)
    tag = "#" + cart_id[:6].upper()
    if ok:
        await callback.answer("✅ Доставка подтверждена!")
        new_text = (callback.message.text or "") + f"\n\n✅ <b>Доставлен — {tag}</b>"
        await callback.message.edit_text(new_text, parse_mode="HTML", reply_markup=None)
    else:
        await callback.answer("⚠️ Уже подтверждён или ошибка.")
        await callback.message.edit_reply_markup(reply_markup=None)


# ── Entry ─────────────────────────────────────────────────────────────────────

async def main() -> None:
    logger.info("Courier bot starting…")
    await dp.start_polling(bot, allowed_updates=["message", "callback_query"])


if __name__ == "__main__":
    asyncio.run(main())
