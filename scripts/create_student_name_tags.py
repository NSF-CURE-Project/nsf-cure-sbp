from pathlib import Path

from create_name_tag_template import build_pdf


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "output" / "pdf" / "name-tags"


NAMES = [
    "Gian Carlo Alvarenga",
    "Matthew Avila",
    "Esteban Cardona",
    "Sheyla Chavez",
    "Justin Chen",
    "Alexa Villanueva Cuellar",
    "Nicholas Escobedo",
    "Jennifer Feliciano",
    "Garret Fiore",
    "Jocelyne Flores",
    "Andrea Gil-Mares",
    "Kimberly Gomez",
    "Karime Gonzalez",
    "Cole Hanson",
    "Limni Hernandez",
    "Jenelle Huerta",
    "Lucas Lindsey",
    "Jose Maria Morales-Moya",
    "Natania Nolasco",
    "Omar Pacheco",
    "Jaden Perez",
    "Victor Quintero",
    "Patrise Rindon",
    "Rogelio Rosales",
    "Adolfo Salto",
    "Cory Stanford",
    "Jacob Swanson",
    "Jilline Tran",
    "Brian Verdugo",
    "Bao-Hung Vo",
]


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for number, name in enumerate(NAMES, start=1):
        output_path = OUTPUT_DIR / f"{name}.pdf"
        build_pdf(output_path=output_path, name=name, number=number)
        print(f"{number:02d}: {name}")


if __name__ == "__main__":
    main()
