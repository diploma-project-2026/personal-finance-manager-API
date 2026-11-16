from pathlib import Path

from models.donut_receipt_model import DonutReceiptModel


BASE_DIR = Path(__file__).resolve().parent.parent
IMAGE_PATH = BASE_DIR / "test-data" / "invoice.png"


model = DonutReceiptModel()

result = model.recognize(str(IMAGE_PATH))

print("\nDonut result:\n")
print(result)