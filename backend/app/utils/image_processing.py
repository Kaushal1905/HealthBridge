import os
import uuid
from werkzeug.utils import secure_filename

FINGERPRINT_DATA_DIR = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "..", "..", "fingerprint_data",
)
FINGERPRINT_DATA_DIR = os.path.normpath(FINGERPRINT_DATA_DIR)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "bmp", "tif", "tiff"}


def _allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def save_fingerprint_image(file, patient_id: str) -> str:
    """
    Save an uploaded fingerprint image to disk.

    Args:
        file: Werkzeug FileStorage object.
        patient_id: The patient's unique ID (used in filename).

    Returns:
        Absolute path to the saved image file.
    """
    os.makedirs(FINGERPRINT_DATA_DIR, exist_ok=True)

    ext = "png"
    if file.filename and "." in file.filename:
        ext = secure_filename(file.filename).rsplit(".", 1)[-1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            ext = "png"

    filename = f"{patient_id}_{uuid.uuid4().hex[:8]}.{ext}"
    save_path = os.path.join(FINGERPRINT_DATA_DIR, filename)
    file.save(save_path)
    return save_path
