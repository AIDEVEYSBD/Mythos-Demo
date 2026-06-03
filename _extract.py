import fitz, io
path = r"c:\Code\Friends\Chandresh\Mythos Demo\mythosreadyv95.pdf"
doc = fitz.open(path)
print("Pages:", doc.page_count)
out = []
for i in range(doc.page_count):
    page = doc[i]
    t = page.get_text().strip()
    out.append("\n===== PAGE %d (chars=%d, images=%d) =====\n%s" % (i+1, len(t), len(page.get_images()), t))
txt = "".join(out)
with io.open(r"c:\Code\Friends\Chandresh\Mythos Demo\_extracted.txt", "w", encoding="utf-8") as f:
    f.write(txt)
print("Total chars:", len(txt))
