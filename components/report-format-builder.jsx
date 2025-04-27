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
  { type: "divider", label: "Divider" },
  { type: "html", label: "HTML" },
];

function FieldPreview({ field }) {
  const style = {
    fontWeight: field.bold ? "bold" : "normal",
    textAlign: field.align,
    fontSize: field.fontSize,
    height: field.height,
    width: field.width,
    background: field.bgColor || undefined,
    color: field.fontColor || undefined,
    overflow: 'auto',
    wordBreak: 'break-all',
    whiteSpace: 'pre-wrap',
    margin: field.margin || undefined,
  };
  if (field.type === "text") return <div className="border rounded px-3 py-2" style={style}>{field.label || "Text Field"}</div>;
  if (field.type === "heading") return <h3 style={{...style, width: style.width || '100%'}}>{field.label || "Heading"}</h3>;
  if (field.type === "textarea") return <textarea placeholder={field.label || "Textarea"} disabled className="w-full border rounded p-2" style={style} />;
  if (field.type === "number") return <Input type="number" placeholder={field.label || "Number"} disabled style={style} />;
  if (field.type === "checkbox") return <label className="flex items-center gap-2" style={style}><input type="checkbox" disabled checked={field.defaultChecked} readOnly /> <span style={{ color: field.fontColor || undefined }}>{field.label || ""}</span></label>;
  if (field.type === "date") return <Input type="date" disabled value={field.exampleDate || ""} style={style} />;
  if (field.type === "image") return <div className="w-full h-20 flex items-center justify-center text-xs" style={{...style, background: field.bgColor || '#f3f3f3'}}>Image</div>;
  if (field.type === "divider") return <div style={{height: field.height || 2, background: field.bgColor || '#ccc', margin: field.margin || '16px 0'}} />;
  if (field.type === "html") return <div className="border rounded p-2" style={style} dangerouslySetInnerHTML={{__html: field.html || '<span style=\'color:#888\'>HTML Alanı</span>'}} />;
  return null;
}

export default function ReportFormatBuilder() {
  const [fields, setFields] = useState([]);
  const [selected, setSelected] = useState(null);
  const [formatName, setFormatName] = useState("");
  const [addType, setAddType] = useState(FIELD_TYPES[0].type);

  const handleAddField = () => {
    const type = addType;
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
      margin: '',
      ...(type === "checkbox" ? { defaultChecked: false } : {}),
      ...(type === "date" ? { exampleDate: "" } : {}),
      ...(type === "divider" ? { height: 2, bgColor: '#ccc', margin: '16px 0' } : {}),
      ...(type === "html" ? { html: "" } : {}),
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

  const handleDeleteField = (id) => {
    setFields(fields.filter(f => f.id !== id));
    if (selected === id) setSelected(null);
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
      <div className="w-56 border-r p-4 flex flex-col gap-4 bg-muted/30">
        <div className="font-semibold mb-2">Alan Ekle</div>
        <div className="flex flex-col gap-2">
          {FIELD_TYPES.map(ft => (
            <Button key={ft.type} variant="outline" onClick={() => {
              const type = ft.type;
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
                margin: '',
                ...(type === "checkbox" ? { defaultChecked: false } : {}),
                ...(type === "date" ? { exampleDate: "" } : {}),
                ...(type === "divider" ? { height: 2, bgColor: '#ccc', margin: '16px 0' } : {}),
                ...(type === "html" ? { html: "" } : {}),
              };
              setFields([...fields, newField]);
              setSelected(newField.id);
            }}>{ft.label}</Button>
          ))}
        </div>
      </div>
      {/* Orta Builder */}
      <div className="flex-1 flex flex-col p-4 gap-2">
        <div className="flex gap-2 mb-4">
          <Input placeholder="Format Adı" value={formatName} onChange={e => setFormatName(e.target.value)} className="w-64" />
          <Button onClick={handleSave} variant="default">Kaydet</Button>
        </div>
        <div className="flex flex-col gap-3">
          {fields.length === 0 && <div className="text-muted-foreground text-center py-8">Alan ekleyin...</div>}
          {fields.map((field, idx) => (
            <div
              key={field.id}
              className={`border rounded-lg bg-white shadow-sm flex flex-col gap-2 p-3 relative group ${selected === field.id ? "ring-2 ring-primary" : ""}`}
              onClick={() => setSelected(field.id)}
              style={{ opacity: selected === field.id ? 1 : 0.95, cursor: 'pointer' }}
              data-id={field.id}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">{field.type}</span>
                <span className="text-xs text-muted-foreground">{field.label}</span>
                <div className="ml-auto flex gap-1">
                  {idx > 0 && <Button size="icon" variant="ghost" onClick={e => {e.stopPropagation(); handleMoveField(idx, idx-1);}}>↑</Button>}
                  {idx < fields.length-1 && <Button size="icon" variant="ghost" onClick={e => {e.stopPropagation(); handleMoveField(idx, idx+1);}}>↓</Button>}
                  <Button size="icon" variant="destructive" onClick={e => {e.stopPropagation(); handleDeleteField(field.id);}}>✕</Button>
                </div>
              </div>
              <div className="p-2 bg-muted/50 rounded">
                <FieldPreview field={field} />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Sağ Panel */}
      <div className="w-72 border-l p-4 bg-muted/30 overflow-auto">
        <div className="font-semibold mb-2">Alan Özellikleri</div>
        {selectedField ? (
          <div className="flex flex-col gap-2">
            {/* Label */}
            {selectedField.type !== "divider" && selectedField.type !== "html" && (
              <Input label="Label" value={selectedField.label} onChange={e => handleFieldChange("label", e.target.value)} />
            )}
            {/* Checkbox metni */}
            {selectedField.type === "checkbox" && (
              <Input label="Metin" value={selectedField.label} onChange={e => handleFieldChange("label", e.target.value)} />
            )}
            {/* Zorunlu */}
            {selectedField.type !== "divider" && selectedField.type !== "html" && (
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={selectedField.required} onChange={e => handleFieldChange("required", e.target.checked)} />
                Zorunlu
              </label>
            )}
            {/* Hizalama */}
            {selectedField.type !== "divider" && selectedField.type !== "html" && (
              <div>
                <label className="block text-xs mb-1">Hizalama</label>
                <select className="border rounded p-1 w-full" value={selectedField.align} onChange={e => handleFieldChange("align", e.target.value)}>
                  <option value="start">Sola</option>
                  <option value="center">Ortala</option>
                  <option value="end">Sağa</option>
                </select>
              </div>
            )}
            {/* Bold */}
            {selectedField.type !== "divider" && selectedField.type !== "html" && (
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={selectedField.bold} onChange={e => handleFieldChange("bold", e.target.checked)} />
                Kalın (Bold)
              </label>
            )}
            {/* Font Size */}
            {selectedField.type !== "divider" && selectedField.type !== "html" && (
              <div>
                <label className="block text-xs mb-1">Font Size</label>
                <select className="border rounded p-1 w-full" value={selectedField.fontSize} onChange={e => handleFieldChange("fontSize", Number(e.target.value))}>
                  <option value={12}>Küçük</option>
                  <option value={16}>Orta</option>
                  <option value={20}>Büyük</option>
                  <option value={24}>Çok Büyük</option>
                </select>
              </div>
            )}
            {/* Height/Width */}
            {selectedField.type !== "divider" && (
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
            )}
            {/* Renkler */}
            <div>
              <label className="block text-xs mb-1">Arka Plan Rengi</label>
              <input type="color" value={selectedField.bgColor || "#ffffff"} onChange={e => handleFieldChange("bgColor", e.target.value)} className="w-10 h-8 p-0 border-none" />
            </div>
            <div>
              <label className="block text-xs mb-1">Font Rengi</label>
              <input type="color" value={selectedField.fontColor || "#000000"} onChange={e => handleFieldChange("fontColor", e.target.value)} className="w-10 h-8 p-0 border-none" />
            </div>
            {/* Checkbox default */}
            {selectedField.type === "checkbox" && (
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={selectedField.defaultChecked} onChange={e => handleFieldChange("defaultChecked", e.target.checked)} />
                Varsayılan olarak işaretli mi?
              </label>
            )}
            {/* Date örnek */}
            {selectedField.type === "date" && (
              <div>
                <label className="block text-xs mb-1">Örnek Tarih</label>
                <Input type="date" value={selectedField.exampleDate || ""} onChange={e => handleFieldChange("exampleDate", e.target.value)} />
              </div>
            )}
            {/* Divider özellikleri */}
            {selectedField.type === "divider" && (
              <>
                <div>
                  <label className="block text-xs mb-1">Kalınlık (px)</label>
                  <Input type="number" value={selectedField.height} onChange={e => handleFieldChange("height", e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs mb-1">Renk</label>
                  <input type="color" value={selectedField.bgColor || "#cccccc"} onChange={e => handleFieldChange("bgColor", e.target.value)} className="w-10 h-8 p-0 border-none" />
                </div>
                <div>
                  <label className="block text-xs mb-1">Margin</label>
                  <Input type="text" value={selectedField.margin} onChange={e => handleFieldChange("margin", e.target.value)} placeholder="ör: 16px 0" />
                </div>
              </>
            )}
            {/* HTML alanı */}
            {selectedField.type === "html" && (
              <div>
                <label className="block text-xs mb-1">HTML</label>
                <textarea className="w-full border rounded p-2 min-h-[80px]" value={selectedField.html} onChange={e => handleFieldChange("html", e.target.value)} placeholder="<b>Örnek HTML</b>" />
              </div>
            )}
            <Button variant="destructive" onClick={() => handleDeleteField(selectedField.id)}>Alanı Sil</Button>
          </div>
        ) : <div className="text-muted-foreground text-sm">Bir alan seçin...</div>}
      </div>
    </div>
  );
} 