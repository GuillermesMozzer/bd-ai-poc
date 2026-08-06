import PyPDF2

with open('c:/Users/Danilo/Smart/src/PBI/[Document Management] [Hierarchical Folder Navigation] Feature description.pdf', 'rb') as file:
    reader = PyPDF2.PdfReader(file)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    with open('c:/Users/Danilo/Smart/pdf_output.txt', 'w', encoding='utf-8') as f:
        f.write(text)
