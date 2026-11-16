from pathlib import Path

from app.models.donut_receipt_model import (
    DonutReceiptModel
)


BASE_DIR = Path(__file__).resolve().parent.parent

TEST_IMAGE = (
    BASE_DIR
    / "dataset"
    / "validation"
    / "images"
    / "lidl_receipt_005.jpg"
)

model = DonutReceiptModel()

result = model.recognize_receipt(
    TEST_IMAGE
)

print()
print("RAW:")
print(result["raw_prediction"])

print()
print("PARSED:")
print(result["parsed"])