"""PDF resume text extraction."""

import io

from ..middleware.error_handler import ValidationError

MAX_RESUME_BYTES = 5 * 1024 * 1024


def extract_text(file_storage) -> str:
    filename = (file_storage.filename or "").lower()
    if not filename.endswith(".pdf") and not filename.endswith(".txt"):
        raise ValidationError("Resume must be a PDF or TXT file")

    data = file_storage.read()
    if len(data) > MAX_RESUME_BYTES:
        raise ValidationError("Resume file is too large (max 5 MB)")
    if not data:
        raise ValidationError("Resume file is empty")

    if filename.endswith(".txt"):
        return data.decode("utf-8", errors="ignore")

    try:
        import pdfplumber
    except ImportError as exc:  # pragma: no cover
        raise ValidationError("Resume parsing is unavailable on this server") from exc

    try:
        pages = []
        with pdfplumber.open(io.BytesIO(data)) as pdf:
            for page in pdf.pages[:10]:
                pages.append(page.extract_text() or "")
    except Exception as exc:
        raise ValidationError("Could not parse the resume PDF") from exc

    text = "\n".join(pages).strip()
    if not text:
        raise ValidationError("No readable text found in the resume")
    return text
