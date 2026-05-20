import cv2
import numpy as np
from app.utils.db import get_db

SIMILARITY_THRESHOLD = 50
RESIZE_DIM = (300, 300)
MAX_FEATURES = 500


def preprocess_image(image_path: str) -> np.ndarray:
    img = cv2.imread(image_path)
    if img is None:
        raise FileNotFoundError(f"Cannot read image at path: {image_path}")
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    return cv2.resize(gray, RESIZE_DIM)


def extract_features(image: np.ndarray):
    orb = cv2.ORB_create(nfeatures=MAX_FEATURES)
    keypoints, descriptors = orb.detectAndCompute(image, None)
    return keypoints, descriptors


def match_descriptors(desc1: np.ndarray, desc2: np.ndarray) -> int:
    if desc1 is None or desc2 is None:
        return 0
    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)
    matches = bf.knnMatch(desc1, desc2, k=2)
    good_matches = [m for m, n in matches if m.distance < 0.75 * n.distance]
    return len(good_matches)


def find_best_match(query_image_path: str) -> dict:
    db = get_db()
    query_img = preprocess_image(query_image_path)
    _, query_desc = extract_features(query_img)

    if query_desc is None:
        return {"matched": False, "patient_id": None, "score": 0,
                "message": "No features extracted from query fingerprint."}

    stored_records = list(db.fingerprints.find({}, {"patient_id": 1, "image_path": 1}))
    best_score = 0
    best_patient_id = None

    for record in stored_records:
        try:
            stored_img = preprocess_image(record["image_path"])
            _, stored_desc = extract_features(stored_img)
            score = match_descriptors(query_desc, stored_desc)
            if score > best_score:
                best_score = score
                best_patient_id = record["patient_id"]
        except FileNotFoundError:
            continue

    if best_score >= SIMILARITY_THRESHOLD:
        return {"matched": True, "patient_id": best_patient_id,
                "score": best_score, "message": "Fingerprint matched successfully."}

    return {"matched": False, "patient_id": None,
            "score": best_score, "message": "No matching fingerprint found above threshold."}
