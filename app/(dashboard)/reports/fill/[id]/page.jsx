"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import jsPDF from "jspdf";

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
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const padding = 40;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const maxContentWidth = pageWidth - 2 * padding;
    let y = padding;
    const rowGap = 28;

    pdf.setFontSize(16);

    format.pages.forEach(page => {
      const fields = page.fields;
      let x = padding;
      let maxHeightInRow = 0;

      let i = 0;
      while (i < fields.length) {
        const field = fields[i];
        let value = values[field.id];
        if (!value || (typeof value === "string" && value.trim() === "")) {
          i++;
          continue;
        }

        // Heading ve Divider her zaman yeni satırda ve tam genişlikte
        if (field.type === "heading") {
          if (x > padding) {
            y += maxHeightInRow || rowGap;
            x = padding;
            maxHeightInRow = 0;
          }
          pdf.setFont(undefined, "bold");
          pdf.setFontSize(18);
          pdf.text(String(value), pageWidth / 2, y, { align: "center" });
          pdf.setFont(undefined, "normal");
          pdf.setFontSize(16);
          y += 32;
          i++;
          continue;
        }
        if (field.type === "divider") {
          if (x > padding) {
            y += maxHeightInRow || rowGap;
            x = padding;
            maxHeightInRow = 0;
          }
          y += 16;
          i++;
          continue;
        }

        // Checkbox her zaman yeni satırda başlar
        if (field.type === "checkbox") {
          if (x > padding) {
            y += maxHeightInRow || rowGap;
            x = padding;
            maxHeightInRow = 0;
          }
          pdf.rect(x, y - 14, 14, 14);
          const checked = (typeof value === "object" ? value.checked : false) || value === true;
          if (checked) {
            pdf.setLineWidth(2);
            pdf.line(x + 3, y - 7, x + 7, y - 2);
            pdf.line(x + 7, y - 2, x + 12, y - 12);
            pdf.setLineWidth(1);
          }
          pdf.text(String(value.content || value), x + 18, y - 2);
          y += rowGap;
          x = padding;
          maxHeightInRow = 0;
          i++;
          continue;
        }

        // Text, Number, Date, Textarea için row gruplama
        if (["text", "number", "date", "textarea"].includes(field.type)) {
          // Sadece bir field'ı ekle, eğer sığmazsa yeni satıra geç
          let fieldWidth = 0;
          let fieldHeight = rowGap;
          let lines = [];
          if (field.type === "textarea") {
            lines = pdf.splitTextToSize(value, maxContentWidth);
            fieldWidth = pdf.getTextWidth(lines[0] || '') + 10;
            fieldHeight = lines.length * 20 + 10;
          } else {
            fieldWidth = pdf.getTextWidth(String(value)) + 10;
          }

          // Eğer bu field eklenince satır aşılacaksa, alt satıra geç
          if (x + fieldWidth > pageWidth - padding) {
            y += maxHeightInRow || rowGap;
            x = padding;
            maxHeightInRow = 0;
          }

          // Field'ı yaz
          if (field.type === "textarea") {
            pdf.text(lines, x, y);
          } else {
            pdf.text(String(value), x, y);
          }
          x += fieldWidth;
          if (fieldHeight > maxHeightInRow) maxHeightInRow = fieldHeight;

          // Eğer bir sonraki field number/date ise ve bu satırda yer yoksa, yeni satıra geç
          if (
            i + 1 < fields.length &&
            ["number", "date"].includes(fields[i].type) &&
            x + pdf.getTextWidth(String(values[fields[i + 1].id] || "")) + 10 > pageWidth - padding
          ) {
            y += maxHeightInRow || rowGap;
            x = padding;
            maxHeightInRow = 0;
          }

          i++;
          continue;
        }

        // Diğer field tipleri için (image, html vs) istersen ekle
        i++;
      }
      // Son satırda field varsa, alt satıra geç
      if (x > padding) {
        y += maxHeightInRow || rowGap;
      }
    });
    pdf.save(`${format?.name || "rapor"}.pdf`);
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
              {/* Alanları gruplayarak render et */}
              {(() => {
                const fields = page.fields;
                const rows = [];
                let i = 0;
                while (i < fields.length) {
                  const field = fields[i];
                  // Eğer text/number/date/textarea ise ve bir sonraki de aynı gruptansa yan yana göster
                  if (["text", "number", "date", "textarea"].includes(field.type)) {
                    const group = [field];
                    let j = i + 1;
                    while (j < fields.length && ["text", "number", "date", "textarea"].includes(fields[j].type)) {
                      group.push(fields[j]);
                      j++;
                    }
                    rows.push(
                      <div key={field.id + "-row"} className="flex gap-4">
                        {group.map(f => {
                          const value = values[f.id] || '';
                          if (f.type === "text") {
                            return (
                              <div key={f.id} className="flex flex-col gap-2 flex-1">
                                <label className="text-sm font-medium">{f.label}</label>
                                <Input
                                  value={value}
                                  onChange={e => handleValueChange(f.id, e.target.value)}
                                  placeholder={f.label}
                                />
                              </div>
                            );
                          }
                          if (f.type === "number") {
                            return (
                              <div key={f.id} className="flex flex-col gap-2 flex-1">
                                <label className="text-sm font-medium">{f.label}</label>
                                <Input
                                  type="number"
                                  value={value}
                                  onChange={e => handleValueChange(f.id, e.target.value)}
                                  placeholder={f.label}
                                />
                              </div>
                            );
                          }
                          if (f.type === "date") {
                            return (
                              <div key={f.id} className="flex flex-col gap-2 flex-1">
                                <label className="text-sm font-medium">{f.label}</label>
                                <Input
                                  type="date"
                                  value={value}
                                  onChange={e => handleValueChange(f.id, e.target.value)}
                                />
                              </div>
                            );
                          }
                          if (f.type === "textarea") {
                            return (
                              <div key={f.id} className="flex flex-col gap-2 flex-1">
                                <label className="text-sm font-medium">{f.label}</label>
                                <textarea
                                  value={value}
                                  onChange={e => handleValueChange(f.id, e.target.value)}
                                  className="w-full border rounded p-2 min-h-[100px]"
                                  placeholder={f.label}
                                />
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    );
                    i = i + group.length;
                    continue;
                  }
                  // Diğer alanlar (ör: heading, checkbox, divider)
                  if (field.type === "heading") {
                    rows.push(
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
                    const value = values[field.id] || { checked: false, content: '' };
                    rows.push(
                      <div key={field.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={value.checked || false}
                          onChange={e => handleValueChange(field.id, { ...value, checked: e.target.checked })}
                        />
                        <Input
                          value={value.content || ''}
                          onChange={e => handleValueChange(field.id, { ...value, content: e.target.value })}
                          placeholder="Checkbox içeriği"
                          className="flex-1"
                        />
                      </div>
                    );
                  } else if (field.type === "divider") {
                    rows.push(<hr key={field.id} className="my-4" />);
                  }
                  i++;
                }
                return rows;
              })()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}