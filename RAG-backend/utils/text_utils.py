# utils/text_utils.py
import re
from collections import Counter
from pathlib import Path
from pypdf import PdfReader
from .ocr_utils import ocr_page

BAD_PHRASES = {"lOMoARcPSD", "Downloaded by"}
BIBLIO_HEADINGS = re.compile(r"(?i)^\s*(Text\s*Books?|References?)\s*:?\s*$")
BIBLIO_LINE_PATTERNS = [
    r"\bISBN\b", r"\bPublisher\b", r"\bEdition\b", r"\bAuthor(s)?\b",
    r"\bText\s*Book\b", r"\bReference\b"
]

def clean_text(txt: str) -> str:
    if not txt:
        return ""
    lines = txt.splitlines()
    kept, skip_refs = [], False
    for raw_line in lines:
        line = raw_line.strip()
        if BIBLIO_HEADINGS.match(line):
            skip_refs = True
            continue
        if skip_refs:
            if re.match(r"^[A-Z0-9 ]{5,}$", line) or re.match(r"^\d+[\.\)]", line):
                skip_refs = False
            else:
                continue
        if any(bad in line for bad in BAD_PHRASES):
            continue
        if any(re.search(pat, line, re.IGNORECASE) for pat in BIBLIO_LINE_PATTERNS):
            continue
        kept.append(line)

    cleaned = "\n".join(kept)
    cleaned = cleaned.replace("-\n", "").replace("\r\n", "\n").replace("\r", "\n")
    cleaned = "\n".join(l.rstrip() for l in cleaned.split("\n"))
    return cleaned.strip()

def extract_text(pdf_path: Path) -> str:
    reader = PdfReader(pdf_path)
    pages_out = []
    for i, page in enumerate(reader.pages, start=1):
        txt = page.extract_text() or ""
        txt = clean_text(txt)
        if is_junk(txt):
            txt = ocr_page(pdf_path, i)
            txt = clean_text(txt)
        pages_out.append(txt)
    return "\n\n".join(pages_out)

def is_junk(text: str, min_len: int = 50, dup_thresh: float = 0.25) -> bool:
    """Detects junk text by length, repetition, and word diversity."""
    if not text.strip() or len(text) < min_len:
        return True
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    line_counts = Counter(lines)
    if line_counts and line_counts.most_common(1)[0][1] / len(lines) > dup_thresh:
        return True
    uniq_ratio = len(set(text.split())) / max(len(text.split()), 1)
    return uniq_ratio < 0.30