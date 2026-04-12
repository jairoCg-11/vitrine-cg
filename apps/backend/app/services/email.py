from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from app.config import settings

# ─── Configuração do cliente de email ─────────────────────────────────────────
# Usa Gmail com App Password — configurado via variáveis de ambiente

conf = ConnectionConfig(
    MAIL_USERNAME=settings.mail_username,
    MAIL_PASSWORD=settings.mail_password,
    MAIL_FROM=settings.mail_username,
    MAIL_FROM_NAME="Vitrine CG",
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
)


async def send_reset_password_email(email: str, name: str, token: str) -> None:
    """
    Envia email com link para redefinição de senha.
    O link expira em 1 hora.
    """
    try:
        reset_url = f"{settings.frontend_url}/auth/redefinir-senha?token={token}"

        html = f"""
        <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; background: #f97316; color: white; width: 48px; height: 48px;
                        border-radius: 12px; line-height: 48px; font-size: 24px; font-weight: 900;">V</div>
            <h2 style="color: #1a1a2e; margin: 8px 0 0;">Vitrine CG</h2>
          </div>

          <h1 style="color: #111827; font-size: 22px; margin-bottom: 8px;">Redefinição de senha</h1>
          <p style="color: #6b7280; margin-bottom: 24px;">
            Olá, <strong>{name}</strong>! Recebemos uma solicitação para redefinir a senha da sua conta.
          </p>

          <a href="{reset_url}"
             style="display: block; background: #f97316; color: white; text-align: center;
                    padding: 14px 24px; border-radius: 12px; font-weight: 700; font-size: 16px;
                    text-decoration: none; margin-bottom: 24px;">
            Redefinir minha senha →
          </a>

          <p style="color: #9ca3af; font-size: 13px; margin-bottom: 8px;">
            Este link expira em <strong>1 hora</strong>. Se você não solicitou a redefinição,
            ignore este email — sua senha permanece a mesma.
          </p>

          <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
          <p style="color: #d1d5db; font-size: 12px; text-align: center;">
            Vitrine CG — Shopping Virtual Popular de Campina Grande
          </p>
        </div>
        """

        message = MessageSchema(
            subject="Redefinição de senha — Vitrine CG",
            recipients=[email],
            body=html,
            subtype=MessageType.html,
        )

        fm = FastMail(conf)
        await fm.send_message(message)
        print(f"✅ Email enviado para {email}")
    except Exception as e:
        print(f"❌ Erro ao enviar email: {e}")


# ─── Adicionar no final de apps/backend/app/services/email.py ────────────────

async def send_store_approved_email(email: str, name: str, store_name: str) -> None:
    """
    Envia email notificando o lojista que sua loja foi aprovada.
    """
    store_url = f"{settings.frontend_url}/lojas"

    html = f"""
    <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; background: #f97316; color: white; width: 48px; height: 48px;
                    border-radius: 12px; line-height: 48px; font-size: 24px; font-weight: 900;">V</div>
        <h2 style="color: #1a1a2e; margin: 8px 0 0;">Vitrine CG</h2>
      </div>

      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: center;">
        <p style="font-size: 32px; margin: 0;">🎉</p>
        <p style="color: #16a34a; font-weight: 700; font-size: 18px; margin: 8px 0 0;">Sua loja foi aprovada!</p>
      </div>

      <p style="color: #374151;">
        Olá, <strong>{name}</strong>! Temos ótimas notícias: sua loja
        <strong>"{store_name}"</strong> foi aprovada e já está visível para
        todos os clientes do Vitrine CG!
      </p>

      <p style="color: #6b7280; margin: 16px 0;">
        Agora você pode:
      </p>
      <ul style="color: #6b7280; padding-left: 20px;">
        <li>Adicionar mais produtos com fotos e descrições</li>
        <li>Receber contatos de clientes pelo WhatsApp</li>
        <li>Acompanhar suas visitas no painel do lojista</li>
      </ul>

      <a href="{settings.frontend_url}/dashboard"
         style="display: block; background: #f97316; color: white; text-align: center;
                padding: 14px 24px; border-radius: 12px; font-weight: 700; font-size: 16px;
                text-decoration: none; margin: 24px 0;">
        Acessar meu painel →
      </a>

      <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
      <p style="color: #d1d5db; font-size: 12px; text-align: center;">
        Vitrine CG — Shopping Virtual Popular de Campina Grande
      </p>
    </div>
    """

    message = MessageSchema(
        subject=f"🎉 Sua loja '{store_name}' foi aprovada! — Vitrine CG",
        recipients=[email],
        body=html,
        subtype=MessageType.html,
    )

    fm = FastMail(conf)
    await fm.send_message(message)


async def send_store_pending_email(email: str, name: str, store_name: str) -> None:
    """
    Envia email notificando o lojista que sua loja está aguardando aprovação.
    """
    html = f"""
    <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; background: #f97316; color: white; width: 48px; height: 48px;
                    border-radius: 12px; line-height: 48px; font-size: 24px; font-weight: 900;">V</div>
        <h2 style="color: #1a1a2e; margin: 8px 0 0;">Vitrine CG</h2>
      </div>

      <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: center;">
        <p style="font-size: 32px; margin: 0;">⏳</p>
        <p style="color: #92400e; font-weight: 700; font-size: 18px; margin: 8px 0 0;">Loja em análise</p>
      </div>

      <p style="color: #374151;">
        Olá, <strong>{name}</strong>! Recebemos o cadastro da sua loja
        <strong>"{store_name}"</strong> no Vitrine CG.
      </p>

      <p style="color: #6b7280; margin: 16px 0;">
        Nossa equipe irá analisar e aprovar sua loja em breve.
        Você receberá um email assim que sua loja estiver disponível para os clientes.
      </p>

      <p style="color: #6b7280;">
        Enquanto aguarda, você já pode acessar seu painel e cadastrar seus produtos!
      </p>

      <a href="{settings.frontend_url}/dashboard"
         style="display: block; background: #f97316; color: white; text-align: center;
                padding: 14px 24px; border-radius: 12px; font-weight: 700; font-size: 16px;
                text-decoration: none; margin: 24px 0;">
        Acessar meu painel →
      </a>

      <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
      <p style="color: #d1d5db; font-size: 12px; text-align: center;">
        Vitrine CG — Shopping Virtual Popular de Campina Grande
      </p>
    </div>
    """

    message = MessageSchema(
        subject=f"Sua loja '{store_name}' está em análise — Vitrine CG",
        recipients=[email],
        body=html,
        subtype=MessageType.html,
    )

    fm = FastMail(conf)
    await fm.send_message(message)