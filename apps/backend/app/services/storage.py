import uuid
from io import BytesIO
from typing import Optional

from minio import Minio
from minio.error import S3Error
from PIL import Image

from app.config import settings

_client: Optional[Minio] = None

# ─── Configurações de compressão por tipo de pasta ───────────────────────────
# max_size: largura/altura máxima em pixels
# quality:  qualidade JPEG (0-100)
COMPRESSION_SETTINGS = {
    "logos":    {"max_size": 400,  "quality": 85},
    "covers":   {"max_size": 1200, "quality": 80},
    "products": {"max_size": 800,  "quality": 80},
    "banners":  {"max_size": 1920, "quality": 82},
}
DEFAULT_COMPRESSION = {"max_size": 800, "quality": 80}


def get_minio_client() -> Minio:
    """Retorna o cliente MinIO, criando-o se necessário."""
    global _client
    if _client is None:
        _client = Minio(
            endpoint=f"{settings.minio_endpoint}:{settings.minio_port}",
            access_key=settings.minio_access_key,
            secret_key=settings.minio_secret_key,
            secure=False,
        )
    return _client


def ensure_bucket_exists(bucket: str) -> None:
    """Cria o bucket se ele ainda não existir."""
    client = get_minio_client()
    if not client.bucket_exists(bucket):
        client.make_bucket(bucket)
        policy = f'''{{
            "Version": "2012-10-17",
            "Statement": [{{
                "Effect": "Allow",
                "Principal": {{"AWS": ["*"]}},
                "Action": ["s3:GetObject"],
                "Resource": ["arn:aws:s3:::{bucket}/*"]
            }}]
        }}'''
        client.set_bucket_policy(bucket, policy)


def compress_image(file_data: bytes, folder: str) -> tuple[bytes, str]:
    """
    Comprime e redimensiona a imagem antes de salvar.

    Retorna os bytes comprimidos e o content_type resultante (sempre JPEG).

    Regras:
    - Redimensiona mantendo proporção até o max_size da pasta
    - Converte para JPEG (exceto PNG com transparência → mantém PNG)
    - Aplica qualidade configurada por pasta
    - Imagens menores que o limite não são ampliadas (só reduzidas)
    """
    config = COMPRESSION_SETTINGS.get(folder, DEFAULT_COMPRESSION)
    max_size = config["max_size"]
    quality = config["quality"]

    img = Image.open(BytesIO(file_data))

    # Preserva PNG com transparência (logos podem ter fundo transparente)
    has_transparency = img.mode in ("RGBA", "LA") or (
        img.mode == "P" and "transparency" in img.info
    )

    # Converte para RGB se não tiver transparência
    if not has_transparency:
        if img.mode != "RGB":
            img = img.convert("RGB")

    # Redimensiona se necessário (mantém proporção, nunca amplia)
    if img.width > max_size or img.height > max_size:
        img.thumbnail((max_size, max_size), Image.LANCZOS)

    # Salva comprimido
    output = BytesIO()

    if has_transparency:
        img.save(output, format="PNG", optimize=True)
        content_type = "image/png"
    else:
        img.save(output, format="JPEG", quality=quality, optimize=True)
        content_type = "image/jpeg"

    output.seek(0)
    return output.getvalue(), content_type


def upload_image(
    file_data: bytes,
    content_type: str,
    folder: str,
) -> str:
    """
    Comprime e faz upload de uma imagem para o MinIO.
    Retorna a URL pública da imagem acessível pelo frontend.
    """
    client = get_minio_client()
    bucket = settings.minio_bucket_produtos

    ensure_bucket_exists(bucket)

    # Comprime antes de salvar
    compressed_data, final_content_type = compress_image(file_data, folder)

    extension = "png" if final_content_type == "image/png" else "jpg"
    filename = f"{folder}/{uuid.uuid4()}.{extension}"

    client.put_object(
        bucket_name=bucket,
        object_name=filename,
        data=BytesIO(compressed_data),
        length=len(compressed_data),
        content_type=final_content_type,
    )

    return f"{settings.minio_public_url}/{bucket}/{filename}"


def delete_image(image_url: str) -> None:
    """Remove uma imagem do MinIO pela URL."""
    try:
        client = get_minio_client()
        bucket = settings.minio_bucket_produtos

        prefix = f"{settings.minio_public_url}/{bucket}/"
        object_name = image_url.replace(prefix, "")

        client.remove_object(bucket, object_name)
    except S3Error:
        pass