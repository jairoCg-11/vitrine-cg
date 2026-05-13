"""
Serviço de notificação via WhatsApp.

Para ativar:
1. Crie uma conta no WhatsApp Business API (Meta) ou use Twilio/Z-API
2. Configure as variáveis no .env:
   WHATSAPP_ENABLED=true
   WHATSAPP_API_URL=https://api.z-api.io/instances/SEU_ID/token/SEU_TOKEN/send-text
   WHATSAPP_INSTANCE_ID=seu_id
   WHATSAPP_TOKEN=seu_token
3. Altere o método send() conforme a API escolhida

Provedores recomendados para Brasil:
- Z-API:   https://z-api.io (simples, low-cost)
- Twilio:  https://twilio.com (mais robusto)
- UltraMsg: https://ultramsg.com (gratuito para testes)
"""

import httpx
from app.config import settings


async def send_whatsapp_notification(phone: str, message: str) -> bool:
    """
    Envia mensagem via WhatsApp.
    Retorna True se enviado, False se desativado ou com erro.

    O phone deve estar no formato internacional: 5583999999999
    """
    if not settings.whatsapp_enabled:
        print(f"[WhatsApp] Desativado — mensagem não enviada para {phone}")
        return False

    if not settings.whatsapp_api_url:
        print("[WhatsApp] WHATSAPP_API_URL não configurado.")
        return False

    try:
        # ─── Adapte este bloco conforme o provedor escolhido ─────────────────
        # Exemplo com Z-API:
        async with httpx.AsyncClient() as client:
            res = await client.post(
                settings.whatsapp_api_url,
                json={"phone": phone, "message": message},
                timeout=10,
            )
            if res.status_code == 200:
                print(f"[WhatsApp] ✅ Mensagem enviada para {phone}")
                return True
            else:
                print(f"[WhatsApp] ❌ Erro {res.status_code}: {res.text}")
                return False
    except Exception as e:
        print(f"[WhatsApp] ❌ Erro ao enviar: {e}")
        return False


async def notify_admin_new_store(store_name: str, owner_name: str, owner_email: str) -> bool:
    """
    Notifica o admin via WhatsApp quando uma nova loja é cadastrada.
    """
    if not settings.admin_whatsapp:
        print("[WhatsApp] ADMIN_WHATSAPP não configurado.")
        return False

    message = (
        f"🏪 *Nova loja cadastrada no Vitrine CG!*\n\n"
        f"*Loja:* {store_name}\n"
        f"*Lojista:* {owner_name}\n"
        f"*Email:* {owner_email}\n\n"
        f"Acesse o painel admin para aprovar:\n"
        f"{settings.frontend_url}/admin"
    )

    return await send_whatsapp_notification(settings.admin_whatsapp, message)