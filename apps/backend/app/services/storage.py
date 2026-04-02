import uuid
from io import BytesIO
from typing import Optional

from minio import Minio
from minio.error import S3Error

from app.config import settings

_client: Optional[Minio] = None


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


def upload_image(
    file_data: bytes,
    content_type: str,
    folder: str,
) -> str:
    """
    Faz upload de uma imagem para o MinIO.
    Retorna a URL pública da imagem acessível pelo frontend.
    """
    client = get_minio_client()
    bucket = settings.minio_bucket_produtos

    ensure_bucket_exists(bucket)

    extension = content_type.split("/")[-1]
    filename = f"{folder}/{uuid.uuid4()}.{extension}"

    client.put_object(
        bucket_name=bucket,
        object_name=filename,
        data=BytesIO(file_data),
        length=len(file_data),
        content_type=content_type,
    )

    # Usa a URL pública configurada — funciona no navegador
    return f"{settings.minio_public_url}/{bucket}/{filename}"


def delete_image(image_url: str) -> None:
    """Remove uma imagem do MinIO pela URL."""
    try:
        client = get_minio_client()
        bucket = settings.minio_bucket_produtos

        # Extrai o nome do objeto da URL pública
        prefix = f"{settings.minio_public_url}/{bucket}/"
        object_name = image_url.replace(prefix, "")

        client.remove_object(bucket, object_name)
    except S3Error:
        pass
