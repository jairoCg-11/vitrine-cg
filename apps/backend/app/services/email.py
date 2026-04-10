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
        