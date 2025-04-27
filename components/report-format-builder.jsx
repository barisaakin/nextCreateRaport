"use client"
import React, { useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const FIELD_TYPES = [
  { type: "text", label: "Text" },
  { type: "heading", label: "Heading" },
  { type: "textarea", label: "Textarea" },
  { type: "number", label: "Number" },
  { type: "checkbox", label: "Checkbox" },
  { type: "date", label: "Date" },
  { type: "image", label: "Image" },
];

function FieldPreview({ field }) {
  let style = {
    fontWeight: field.bold ? "bold" : "normal",
    fontSize: field.fontSize,
    height: field.height,
    width: field.width,
    background: field.bgColor || undefined,
    color: field.fontColor || undefined,
    overflow: 'auto',
    wordBreak: 'break-all',
    whiteSpace: 'pre-wrap',
  };
  if (field.type === "text") {
    style.textAlign = field.align;
    return <div className="border rounded px-3 py-2" style={style}>{field.label || "Text Field"}</div>;
  }
  if (field.type === "heading") {
    style.textAlign = field.align;
    style.width = style.width || '100%';
    return <h3 style={style}>{field.label || "Heading"}</h3>;
  }
  if (field.type === "textarea") return <textarea placeholder={field.label || "Textarea"} disabled className="w-full border rounded p-2" style={style} />;
  if (field.type === "number") return <Input type="number" placeholder={field.label || "Number"} disabled style={style} />;
  if (field.type === "checkbox") return <label className="flex items-center gap-2" style={style}><input type="checkbox" disabled checked={field.defaultChecked} readOnly /> <span style={{ color: field.fontColor || undefined }}>{field.label || ""}</span></label>;
  if (field.type === "date") return <Input type="date" disabled value={field.exampleDate || ""} style={style} />;
  if (field.type === "image") return <div className="w-full h-20 bg-muted flex items-center justify-center text-xs text-muted-foreground" style={style}>Image</div>;
  return null;
}

export default function ReportFormatBuilder() {
  const [fields, setFields] = useState([]);
  const [selected, setSelected] = useState(null);
  const [formatName, setFormatName] = useState("");

  const handleAddField = (type) => {
    const newField = {
      id: Date.now() + Math.random(),
      type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
      required: false,
      align: "start",
      bold: false,
      fontSize: 16,
      height: "",
      width: "",
      bgColor: "",
      fontColor: "",
      ...(type === "checkbox" ? { defaultChecked: false } : {}),
      ...(type === "date" ? { exampleDate: "" } : {}),
    };
    setFields([...fields, newField]);
    setSelected(newField.id);
  };

  const handleMoveField = (from, to) => {
    setFields(arrayMove(fields, from, to));
  };

  const handleFieldChange = (key, value) => {
    setFields(fields.map(f => f.id === selected ? { ...f, [key]: value } : f));
  };

  const handleDeleteField = () => {
    setFields(fields.filter(f => f.id !== selected));
    setSelected(null);
  };

  const selectedField = fields.find(f => f.id === selected);

  const handleSave = () => {
    const format = {
      name: formatName,
      fields,
    };
    console.log("Saved format:", format);
    alert("Format JSON'u console'a yazıldı!");
  };

  return (
    <div className="flex h-[80vh] gap-4">
      {/* Sol Panel */}
      <div className="w-48 border-r p-4 flex flex-col gap-2 bg-muted/30">
        <div className="font-semibold mb-2">Alanlar</div>
        {FIELD_TYPES.map(ft => (
          <Button key={ft.type} variant="outline" onClick={() => handleAddField(ft.type)}>{ft.label}</Button>
        ))}
      </div>
      {/* Orta Builder */}
      <div className="flex-1 flex flex-col p-4 gap-2">
        <div className="flex gap-2 mb-4">
          <Input placeholder="Format Adı" value={formatName} onChange={e => setFormatName(e.target.value)} className="w-64" />
          <Button onClick={handleSave} variant="default">Kaydet</Button>
        </div>
        <div className="flex flex-col gap-2">
          {fields.length === 0 && <div className="text-muted-foreground text-center py-8">Alan ekleyin...</div>}
          {fields.map((field, idx) => (
            <div
              key={field.id}
              className={`border rounded p-3 bg-white flex items-center gap-4 cursor-pointer ${selected === field.id ? "ring-2 ring-primary" : ""}`}
              onClick={() => setSelected(field.id)}
              style={{ opacity: selected === field.id ? 1 : 0.9 }}
              data-id={field.id}
            >
              <span className="text-xs text-muted-foreground w-20">{field.type}</span>
              <FieldPreview field={field} />
              <div className="ml-auto flex gap-1">
                {idx > 0 && <Button size="icon" variant="ghost" onClick={e => {e.stopPropagation(); handleMoveField(idx, idx-1);}}>↑</Button>}
                {idx < fields.length-1 && <Button size="icon" variant="ghost" onClick={e => {e.stopPropagation(); handleMoveField(idx, idx+1);}}>↓</Button>}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Sağ Panel */}
      <div className="w-64 border-l p-4 bg-muted/30 overflow-auto">
        <div className="font-semibold mb-2">Alan Özellikleri</div>
        {selectedField ? (
          <div className="flex flex-col gap-2">
            {(selectedField.type !== "checkbox") && (
              <Input label="Label" value={selectedField.label} onChange={e => handleFieldChange("label", e.target.value)} />
            )}
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={selectedField.required} onChange={e => handleFieldChange("required", e.target.checked)} />
              Zorunlu
            </label>
            <div>
              <label className="block text-xs mb-1">Hizalama</label>
              <select className="border rounded p-1 w-full" value={selectedField.align} onChange={e => handleFieldChange("align", e.target.value)}>
                <option value="start">Sola</option>
                <option value="center">Ortala</option>
                <option value="end">Sağa</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={selectedField.bold} onChange={e => handleFieldChange("bold", e.target.checked)} />
              Kalın (Bold)
            </label>
            <div>
              <label className="block text-xs mb-1">Font Size</label>
              <select className="border rounded p-1 w-full" value={selectedField.fontSize} onChange={e => handleFieldChange("fontSize", Number(e.target.value))}>
                <option value={12}>Küçük</option>
                <option value={16}>Orta</option>
                <option value={20}>Büyük</option>
                <option value={24}>Çok Büyük</option>
              </select>
            </div>
            <div className="flex gap-2">
              <div>
                <label className="block text-xs mb-1">Height</label>
                <Input type="text" value={selectedField.height} onChange={e => handleFieldChange("height", e.target.value)} placeholder="ör: 40px veya auto" />
              </div>
              <div>
                <label className="block text-xs mb-1">Width</label>
                <Input type="text" value={selectedField.width} onChange={e => handleFieldChange("width", e.target.value)} placeholder="ör: 100% veya 200px" />
              </div>
            </div>
            <div>
              <label className="block text-xs mb-1">Arka Plan Rengi</label>
              <input type="color" value={selectedField.bgColor || "#ffffff"} onChange={e => handleFieldChange("bgColor", e.target.value)} className="w-10 h-8 p-0 border-none" />
            </div>
            <div>
              <label className="block text-xs mb-1">Font Rengi</label>
              <input type="color" value={selectedField.fontColor || "#000000"} onChange={e => handleFieldChange("fontColor", e.target.value)} className="w-10 h-8 p-0 border-none" />
            </div>
            {selectedField.type === "checkbox" && (
              <>
                <Input label="Metin" value={selectedField.label} onChange={e => handleFieldChange("label", e.target.value)} />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={selectedField.defaultChecked} onChange={e => handleFieldChange("defaultChecked", e.target.checked)} />
                  Varsayılan olarak işaretli mi?
                </label>
              </>
            )}
            {selectedField.type === "date" && (
              <div>
                <label className="block text-xs mb-1">Örnek Tarih</label>
                <Input type="date" value={selectedField.exampleDate || ""} onChange={e => handleFieldChange("exampleDate", e.target.value)} />
              </div>
            )}
            <Button variant="destructive" onClick={handleDeleteField}>Alanı Sil</Button>
          </div>
        ) : <div className="text-muted-foreground text-sm">Bir alan seçin...</div>}
      </div>
    </div>
  );
} 