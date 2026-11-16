import json
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_DIR = BASE_DIR / "dataset"
IMAGES_DIR = DATASET_DIR / "images"
METADATA_FILE = DATASET_DIR / "metadata.jsonl"


def main():
    samples = []

    with open(METADATA_FILE, "r", encoding="utf-8") as file:
        for line_number, line in enumerate(file, start=1):
            line = line.strip()

            if not line:
                continue

            sample = json.loads(line)

            file_name = sample["file_name"]
            ground_truth = sample["ground_truth"]

            image_path = IMAGES_DIR / file_name

            if not image_path.exists():
                raise FileNotFoundError(
                    f"Image not found for line {line_number}: {image_path}"
                )

            required_fields = [
                "merchant",
                "date",
                "total",
                "currency",
                "line_items"
            ]

            for field in required_fields:
                if field not in ground_truth:
                    raise ValueError(
                        f"Missing field '{field}' in {file_name}"
                    )

            samples.append(sample)

            print(
                f"[OK] {file_name} "
                f"- {len(ground_truth['line_items'])} line items"
            )

    print()
    print(f"Dataset valid. Total samples: {len(samples)}")


if __name__ == "__main__":
    main()