"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import jsPDF from "jspdf";
import 'jspdf-autotable';

// Türkçe karakter dönüşüm tablosu
const turkishCharMap = {
  'ç': 'c', 'Ç': 'C',
  'ğ': 'g', 'Ğ': 'G',
  'ı': 'i', 'İ': 'I',
  'ö': 'o', 'Ö': 'O',
  'ş': 's', 'Ş': 'S',
  'ü': 'u', 'Ü': 'U',
  'â': 'a', 'Â': 'A',
  'î': 'i', 'Î': 'I',
  'û': 'u', 'Û': 'U'
};

// Türkçe karakterleri dönüştüren fonksiyon
const convertTurkishChars = (text) => {
  return text.replace(/[çÇğĞıİöÖşŞüÜâÂîÎûÛ]/g, char => turkishCharMap[char] || char);
};

// Türkçe karakterleri destekleyen font
const turkishFont = {
  normal: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.ttf',
  bold: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc4.ttf',
  italics: 'https://fonts.gstatic.com/s/roboto/v30/KFOkCnqEu92Fr1Mu51xIIzIXKMny.ttf',
  bolditalics: 'https://fonts.gstatic.com/s/roboto/v30/KFOjCnqEu92Fr1Mu51TzBic6CsI4.ttf'
};

export default function Page({ params }) {
  const router = useRouter();
  const [format, setFormat] = useState(null);
  const [values, setValues] = useState({});

  useEffect(() => {
    // Formatı localStorage'dan al
    const savedFormats = localStorage.getItem('reportFormats');
    if (savedFormats) {
      const formats = JSON.parse(savedFormats);
      const foundFormat = formats.find(f => f.id === parseInt(params.id));
      if (foundFormat) {
        setFormat(foundFormat);
        // Her sayfa için boş değerler oluştur
        const initialValues = {};
        foundFormat.pages.forEach(page => {
          page.fields.forEach(field => {
            initialValues[field.id] = '';
          });
        });
        setValues(initialValues);
      } else {
        router.push("/reports");
      }
    } else {
      router.push("/reports");
    }
  }, [params.id, router]);

  const handleValueChange = (fieldId, value) => {
    setValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSave = () => {
    // Değerleri localStorage'a kaydet
    const savedReports = localStorage.getItem('filledReports') || '{}';
    const reports = JSON.parse(savedReports);
    reports[params.id] = {
      formatId: params.id,
      values,
      filledAt: new Date().toISOString()
    };
    localStorage.setItem('filledReports', JSON.stringify(reports));
    router.push("/reports");
  };

  const handleDownloadPDF = async () => {
    if (!format) return;
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
      putOnlyUsedFonts: true,
      floatPrecision: 16
    });

    const padding = 40;
    const pageWidth = pdf.internal.pageSize.getWidth();
    let y = padding;
    let x = padding;
    const space = 5;
    const lineHeight = 20;
    const paragraphIndent = 20;

    // Font ayarları
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);

    format.pages.forEach(page => {
      x = padding;
      y += 0;

      let fields = page.fields;
      let i = 0;
      let shouldMoveToNextLine = false;
      while (i < fields.length) {
        const field = fields[i];
        let value = values[field.id];
        if (!value || (typeof value === "string" && value.trim() === "")) {
          i++;
          continue;
        }

        // Alt satıra geçme kontrolü (number alanı ve sonrası için)
        if ((shouldMoveToNextLine || (field.type === "number" && values[`${field.id}_newLine`])) && x > padding) {
          y += lineHeight;
          x = padding;
        }

        // Number alanı için üstten padding ekle (alt satıra geçilsin mi true ise)
        if (field.type === "number" && values[`${field.id}_newLine`]) {
          y += 20;
        }

        // Heading ve Divider
        if (field.type === "heading") {
          if (x > padding) {
            y += lineHeight;
            x = padding;
          }
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(18);
          pdf.text(convertTurkishChars(String(value)), pageWidth / 2, y, { align: "center" });
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(12);
          y += 32;
          x = padding;
          i++;
          continue;
        }
        if (field.type === "divider") {
          if (x > padding) {
            y += lineHeight;
            x = padding;
          }
          y += 16;
          i++;
          continue;
        }

        // Checkbox
        if (field.type === "checkbox") {
          const checkboxValue = typeof value === 'object' ? value.content : value;
          const fieldWidth = 18 + pdf.getTextWidth(convertTurkishChars(String(checkboxValue))) + space;
          if (x + fieldWidth > pageWidth - padding) {
            y += lineHeight;
            x = padding;
          }
          pdf.rect(x, y - 14, 14, 14);
          const checked = (typeof value === "object" ? value.checked : false) || value === true;
          if (checked) {
            pdf.setLineWidth(2);
            pdf.line(x + 3, y - 7, x + 7, y - 2);
            pdf.line(x + 7, y - 2, x + 12, y - 12);
            pdf.setLineWidth(1);
          }
          pdf.text(convertTurkishChars(String(checkboxValue)), x + 18, y - 2);
          x += fieldWidth;
          i++;
          continue;
        }

        // Tüm inline field'lar için (text, textarea, number, date)
        if (["text", "textarea", "number", "date"].includes(field.type)) {
          let displayValue = String(value);
          if (field.type === "date" && value) {
            displayValue = value.length > 10 ? value.slice(0, 10) : value;
          }
          
          // Türkçe karakterleri dönüştür
          displayValue = convertTurkishChars(displayValue);
          
          // Satırda kalan boşluğa göre split et
          let remainingWidth = pageWidth - padding - x;
          let lines = pdf.splitTextToSize(displayValue, remainingWidth);

          // Textarea için özel işlem
          if (field.type === "textarea") {
            y += lineHeight; // Yeni satıra geç
            x = padding ; // Paragraf boşluğu ekle
            remainingWidth = pageWidth - padding - paragraphIndent; // Kalan genişliği güncelle
            lines = pdf.splitTextToSize(displayValue, remainingWidth);
          }

          for (let l = 0; l < lines.length; l++) {
            const line = lines[l];
            const fieldWidth = pdf.getTextWidth(line);

            // Satırda yer yoksa alta geç
            if (x + fieldWidth > pageWidth - padding) {
              y += lineHeight;
              x = padding;
            }

            pdf.text(line, x, y);
            x += fieldWidth + space;
          }  
          i++;
          continue;
        }
        i++;
      }
      // Sayfa sonunda bir alt satıra geç
      y += lineHeight;
      x = padding;
    });

    pdf.save(`${convertTurkishChars(format?.name || "rapor")}.pdf`);
  };

  if (!format) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Formatı Doldur: {format.name}</h1>
        <div className="flex gap-2">
          <Button onClick={handleSave}>Kaydet</Button>
          <Button variant="outline" onClick={handleDownloadPDF}>PDF olarak indir</Button>
        </div>
      </div>
      <div id="report-pdf-content" className="flex flex-col gap-8 bg-white p-10 rounded-lg shadow-md" style={{minWidth: 600, maxWidth: 900, margin: '0 auto'}}>
        {format.pages.map((page, pageIndex) => (
          <div key={page.id} className="bg-white rounded-lg border p-6" style={{padding: 24}}>
            <h2 className="text-xl font-semibold mb-4">{page.name}</h2>
            <div className="grid gap-4">
              {/* Alanları alt alta render et */}
              {page.fields.map(field => {
                const value = values[field.id] || '';
                if (["text", "number", "date", "textarea"].includes(field.type)) {
                  return (
                    <div key={field.id} className="flex flex-col gap-2">
                      <label className="text-sm font-medium">{field.label}</label>
                      {field.type === "text" && (
                        <Input
                          value={value}
                          onChange={e => handleValueChange(field.id, e.target.value)}
                          placeholder={field.label}
                        />
                      )}
                      {field.type === "number" && (
                        <div className="flex flex-col gap-2">
                          <Input
                            type="number"
                            value={value}
                            onChange={e => handleValueChange(field.id, e.target.value)}
                            placeholder={field.label}
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={values[`${field.id}_newLine`] || false}
                              onChange={e => handleValueChange(`${field.id}_newLine`, e.target.checked)}
                            />
                            <label className="text-sm">Alt satıra geç</label>
                          </div>
                        </div>
                      )}
                      {field.type === "date" && (
                        <Input
                          type="date"
                          value={value}
                          onChange={e => handleValueChange(field.id, e.target.value)}
                        />
                      )}
                      {field.type === "textarea" && (
                        <textarea
                          value={value}
                          onChange={e => handleValueChange(field.id, e.target.value)}
                          className="w-full border rounded p-2 min-h-[100px]"
                          placeholder={field.label}
                        />
                      )}
                    </div>
                  );
                }
                // Diğer field tipleri (heading, checkbox, divider vs) için mevcut renderı koru
                if (field.type === "heading") {
                  return (
                    <div key={field.id} className="flex flex-col gap-2">
                      <label className="text-sm font-medium">{field.label}</label>
                      <Input
                        value={values[field.id] || ''}
                        onChange={e => handleValueChange(field.id, e.target.value)}
                        placeholder={field.label}
                        className="text-xl font-bold"
                      />
                    </div>
                  );
                } else if (field.type === "checkbox") {
                  const checkboxValue = values[field.id] || { checked: false, content: '' };
                  return (
                    <div key={field.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={checkboxValue.checked || false}
                        onChange={e => handleValueChange(field.id, { ...checkboxValue, checked: e.target.checked })}
                      />
                      <Input
                        value={checkboxValue.content || ''}
                        onChange={e => handleValueChange(field.id, { ...checkboxValue, content: e.target.value })}
                        placeholder="Checkbox içeriği"
                        className="flex-1"
                      />
                    </div>
                  );
                } else if (field.type === "divider") {
                  return <hr key={field.id} className="my-4" />;
                }
                return null;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}