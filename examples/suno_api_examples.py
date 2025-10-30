"""
Exemplos de implementação da Suno API em Python.
Este script contém funções para cada endpoint principal da Suno API.
Substitua `YOUR_API_KEY` pelo seu token e ajuste os parâmetros conforme necessário.

Requisitos:
- Instale a biblioteca `requests` (ex.: pip install requests).

As funções retornam o objeto Response da biblioteca requests.
"""
import requests
from typing import Dict, Any, Optional

# Configuração básica
API_BASE_URL = "https://api.sunoapi.org/api/v1"
API_KEY = "YOUR_API_KEY"  # Substitua pelo seu token real
HEADERS_JSON = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}
HEADERS_FORM = {
    "Authorization": f"Bearer {API_KEY}"
}

# 1. Geração de música
def generate_music(params: Dict[str, Any]) -> requests.Response:
    """Cria uma música com base nos parâmetros fornecidos.

    Parâmetros esperados:
      - prompt (str)
      - customMode (bool)
      - instrumental (bool)
      - style (str)
      - title (str)
      - model (str)
      - callBackUrl (str), etc.

    Retorna: Response contendo o taskId.
    """
    url = f"{API_BASE_URL}/generate"
    return requests.post(url, json=params, headers=HEADERS_JSON)

# 2. Extensão de música
def extend_music(params: Dict[str, Any]) -> requests.Response:
    """Estende uma música existente.

    Parâmetros obrigatórios:
      - audioId: ID da música a ser estendida
      - defaultParamFlag (bool)
      - se defaultParamFlag=True: forneça prompt, style, title, continueAt, etc.
    """
    url = f"{API_BASE_URL}/generate/extend"
    return requests.post(url, json=params, headers=HEADERS_JSON)

# 3. Upload e cover de áudio
def upload_cover(params: Dict[str, Any]) -> requests.Response:
    """Carrega um áudio e gera um cover.

    Parâmetros:
      - uploadUrl (str): URL do arquivo original
      - customMode (bool)
      - instrumental (bool)
      - prompt/style/title conforme modo
      - model, callBackUrl etc.
    """
    url = f"{API_BASE_URL}/generate/upload-cover"
    return requests.post(url, json=params, headers=HEADERS_JSON)

# 4. Upload e extensão de áudio
def upload_extend(params: Dict[str, Any]) -> requests.Response:
    """Carrega um áudio e o estende.

    Parâmetros:
      - uploadUrl (str)
      - defaultParamFlag (bool)
      - se defaultParamFlag=True: prompt, style, title, continueAt
      - callBackUrl, model etc.
    """
    url = f"{API_BASE_URL}/generate/upload-extend"
    return requests.post(url, json=params, headers=HEADERS_JSON)

# 5. Adicionar instrumental
def add_instrumental(params: Dict[str, Any]) -> requests.Response:
    """Gera um acompanhamento instrumental.

    Parâmetros:
      - uploadUrl (str)
      - title (str)
      - tags (str)
      - negativeTags (str)
      - callBackUrl (str)
      - modelo (opcional)
    """
    url = f"{API_BASE_URL}/generate/add-instrumental"
    return requests.post(url, json=params, headers=HEADERS_JSON)

# 6. Adicionar vocais
def add_vocals(params: Dict[str, Any]) -> requests.Response:
    """Adiciona vocais a um instrumental existente.

    Parâmetros:
      - uploadUrl (str)
      - prompt (str)
      - title (str)
      - style (str)
      - negativeTags (str)
      - callBackUrl (str)
    """
    url = f"{API_BASE_URL}/generate/add-vocals"
    return requests.post(url, json=params, headers=HEADERS_JSON)

# 7. Obter detalhes de uma tarefa (poll)
def get_task_info(task_id: str) -> requests.Response:
    """Recupera informações detalhadas de uma geração de música.

    Args:
      task_id: ID da tarefa
    """
    url = f"{API_BASE_URL}/generate/record-info?taskId={task_id}"
    return requests.get(url, headers=HEADERS_JSON)

# 8. Obter letras com timestamps
def get_timestamped_lyrics(params: Dict[str, Any]) -> requests.Response:
    """Obtém letras sincronizadas com tempo.

    Parâmetros:
      - taskId (str)
      - audioId (str) ou musicIndex (int)
    """
    url = f"{API_BASE_URL}/generate/get-timestamped-lyrics"
    return requests.post(url, json=params, headers=HEADERS_JSON)

# 9. Potenciar estilo musical
def boost_music_style(content: str) -> requests.Response:
    """Gera um estilo potenciado (modelos V4_5+)."""
    url = f"{API_BASE_URL}/style/generate"
    payload = {"content": content}
    return requests.post(url, json=payload, headers=HEADERS_JSON)

# 10. Gerar persona
def generate_persona(params: Dict[str, Any]) -> requests.Response:
    """Cria uma persona personalizada.

    Parâmetros:
      - taskId (str)
      - musicIndex (int)
      - name (str)
      - description (str)
    """
    url = f"{API_BASE_URL}/generate/generate-persona"
    return requests.post(url, json=params, headers=HEADERS_JSON)

# 11. Gerar capa de música
def generate_music_cover(task_id: str, callback_url: str) -> requests.Response:
    """Solicita geração de capa.

    Args:
      task_id: ID da música original
      callback_url: URL para receber o retorno
    """
    url = f"{API_BASE_URL}/suno/cover/generate"
    payload = {"taskId": task_id, "callBackUrl": callback_url}
    return requests.post(url, json=payload, headers=HEADERS_JSON)

# 12. Obter detalhes da capa
def get_music_cover_info(task_id: str) -> requests.Response:
    url = f"{API_BASE_URL}/suno/cover/record-info?taskId={task_id}"
    return requests.get(url, headers=HEADERS_JSON)

# 13. Gerar letras
def generate_lyrics(prompt: str, callback_url: str) -> requests.Response:
    url = f"{API_BASE_URL}/lyrics"
    payload = {"prompt": prompt, "callBackUrl": callback_url}
    return requests.post(url, json=payload, headers=HEADERS_JSON)

# 14. Obter detalhes das letras
def get_lyrics_info(task_id: str) -> requests.Response:
    url = f"{API_BASE_URL}/lyrics/record-info?taskId={task_id}"
    return requests.get(url, headers=HEADERS_JSON)

# 15. Converter para WAV
def convert_to_wav(task_id: str, audio_id: str, callback_url: str) -> requests.Response:
    url = f"{API_BASE_URL}/wav/generate"
    payload = {"taskId": task_id, "audioId": audio_id, "callBackUrl": callback_url}
    return requests.post(url, json=payload, headers=HEADERS_JSON)

# 16. Obter detalhes do WAV
def get_wav_info(task_id: str) -> requests.Response:
    url = f"{API_BASE_URL}/wav/record-info?taskId={task_id}"
    return requests.get(url, headers=HEADERS_JSON)

# 17. Separação de vocais / stems
def vocal_removal(params: Dict[str, Any]) -> requests.Response:
    """Separa vocal/instrumento ou múltiplos stems.

    Parâmetros:
      - taskId (str)
      - audioId (str)
      - type (str): 'separate_vocal' ou 'split_stem'
      - callBackUrl (str)
    """
    url = f"{API_BASE_URL}/vocal-removal/generate"
    return requests.post(url, json=params, headers=HEADERS_JSON)

# 18. Obter detalhes da separação
def get_vocal_removal_info(task_id: str) -> requests.Response:
    url = f"{API_BASE_URL}/vocal-removal/record-info?taskId={task_id}"
    return requests.get(url, headers=HEADERS_JSON)

# 19. Criar vídeo musical
def create_music_video(task_id: str, audio_id: str, callback_url: str, author: Optional[str] = None, domain_name: Optional[str] = None) -> requests.Response:
    url = f"{API_BASE_URL}/mp4/generate"
    payload = {
        "taskId": task_id,
        "audioId": audio_id,
        "callBackUrl": callback_url
    }
    if author:
        payload["author"] = author
    if domain_name:
        payload["domainName"] = domain_name
    return requests.post(url, json=payload, headers=HEADERS_JSON)

# 20. Obter detalhes do vídeo
def get_music_video_info(task_id: str) -> requests.Response:
    url = f"{API_BASE_URL}/mp4/record-info?taskId={task_id}"
    return requests.get(url, headers=HEADERS_JSON)

# 21. Consultar saldo de créditos
def get_remaining_credits() -> requests.Response:
    url = f"{API_BASE_URL}/generate/credit"
    return requests.get(url, headers=HEADERS_JSON)

# 22. Upload Base64
def base64_upload(base64_data: str, upload_path: str, file_name: Optional[str] = None) -> requests.Response:
    url = f"{API_BASE_URL.replace('/api/v1', '')}/api/file-base64-upload"
    payload = {
        "base64Data": base64_data,
        "uploadPath": upload_path
    }
    if file_name:
        payload["fileName"] = file_name
    return requests.post(url, json=payload, headers=HEADERS_JSON)

# 23. Upload via stream
def stream_upload(file_path: str, upload_path: str, file_name: Optional[str] = None) -> requests.Response:
    url = f"{API_BASE_URL.replace('/api/v1', '')}/api/file-stream-upload"
    files = {"file": open(file_path, "rb")}
    data = {
        "uploadPath": upload_path
    }
    if file_name:
        data["fileName"] = file_name
    return requests.post(url, files=files, data=data, headers=HEADERS_FORM)

# 24. Upload via URL
def url_upload(file_url: str, upload_path: str, file_name: Optional[str] = None) -> requests.Response:
    url = f"{API_BASE_URL.replace('/api/v1', '')}/api/file-url-upload"
    payload = {
        "fileUrl": file_url,
        "uploadPath": upload_path
    }
    if file_name:
        payload["fileName"] = file_name
    return requests.post(url, json=payload, headers=HEADERS_JSON)

if __name__ == "__main__":
    # Exemplo de uso: gerar música simples (modo não-personalizado)
    params = {
        "prompt": "Uma música calma e relaxante de piano.",
        "customMode": False,
        "callBackUrl": "https://seu-dominio.com/callback"  # OBRIGATÓRIO!
    }
    response = generate_music(params)
    print("Status: ", response.status_code)
    print(response.json())
