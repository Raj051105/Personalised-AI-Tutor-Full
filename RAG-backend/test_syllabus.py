from pathlib import Path
from syllabus_extractor import extract_structured_syllabus
import json

def test_extraction():
    # Use the existing syllabus file found in CS3491/syllabus
    pdf_path = Path("data/CS3491/syllabus/aiml-syllabus.pdf")
    
    if not pdf_path.exists():
        print(f"File not found: {pdf_path}")
        return

    print(f"--- Starting extraction for: {pdf_path.name} ---")
    try:
        print("Extracting text from PDF...")
        structured_syllabus = extract_structured_syllabus(pdf_path)
        
        # Display the result in a pretty format
        print("\nStructured Output:")
        print(json.dumps(structured_syllabus, indent=2))
        
        if not structured_syllabus:
            print("\nWarning: No content was extracted. Check if Ollama is running and has the model llama3.1:8b.")
            
    except Exception as e:
        print(f"\nAn error occurred during extraction: {e}")

if __name__ == "__main__":
    test_extraction()
