"use client"
import React, { useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Heading, Text, List, Hash, Calendar, Image as IconImage, Minus, Code2, Plus, ChevronLeft, ChevronRight } from "lucide-react";

const FIELD_TYPES = [
  { type: "text", label: "Text", icon: <Text className="w-4 h-4" /> },
  { type: "heading", label: "Heading", icon: <Heading className="w-4 h-4" /> },
  { type: "textarea", label: "Textarea", icon: <List className="w-4 h-4" /> },
  { type: "number", label: "Number", icon: <Hash className="w-4 h-4" /> },
  { type: "checkbox", label: "Checkbox", icon: <Check className="w-4 h-4" /> },
  { type: "date", label: "Date", icon: <Calendar className="w-4 h-4" /> },
  { type: "image", label: "Image", icon: <IconImage className="w-4 h-4" /> },
  { type: "divider", label: "Divider", icon: <Minus className="w-4 h-4" /> },
  { type: "html", label: "HTML", icon: <Code2 className="w-4 h-4" /> },
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

export default function ReportFormatBuilder({ onSave, initialFormat }) {
  const [pages, setPages] = useState(initialFormat?.pages || [{ id: 1, fields: [], name: "Page 1" }]);
  const [currentPage, setCurrentPage] = useState(0);
  const [selected, setSelected] = useState(null);
  const [formatName, setFormatName] = useState(initialFormat?.name || "");
  const [addType, setAddType] = useState(FIELD_TYPES[0].type);

  const currentFields = pages[currentPage].fields;

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
      margin: '',
      ...(type === "checkbox" ? { defaultChecked: false, content: "" } : {}),
      ...(type === "date" ? { exampleDate: "" } : {}),
      ...(type === "divider" ? { height: 2, bgColor: '#ccc', margin: '16px 0' } : {}),
      ...(type === "html" ? { html: "" } : {}),
    };

    // Eğer bir text alanı seçiliyse ve yeni alan number veya date ise
    if (selected && (type === "number" || type === "date")) {
      const selectedField = currentFields.find(f => f.id === selected);
      if (selectedField && selectedField.type === "text") {
        const selectedIndex = currentFields.findIndex(f => f.id === selected);
        const updatedPages = [...pages];
        updatedPages[currentPage].fields = [
          ...currentFields.slice(0, selectedIndex + 1),
          newField,
          ...currentFields.slice(selectedIndex + 1)
        ];
        setPages(updatedPages);
        setSelected(newField.id);
        return;
      }
    }

    const updatedPages = [...pages];
    updatedPages[currentPage].fields = [...currentFields, newField];
    setPages(updatedPages);
    setSelected(newField.id);
  };

  const handleMoveField = (from, to) => {
    const updatedPages = [...pages];
    updatedPages[currentPage].fields = arrayMove(currentFields, from, to);
    setPages(updatedPages);
  };

  const handleFieldChange = (key, value) => {
    const updatedPages = [...pages];
    updatedPages[currentPage].fields = currentFields.map(f => f.id === selected ? { ...f, [key]: value } : f);
    setPages(updatedPages);
  };

  const handleDeleteField = (id) => {
    const updatedPages = [...pages];
    updatedPages[currentPage].fields = currentFields.filter(f => f.id !== id);
    setPages(updatedPages);
    if (selected === id) setSelected(null);
  };

  const handleAddPage = () => {
    const newPage = {
      id: pages.length + 1,
      fields: [],
      name: `Page ${pages.length + 1}`
    };
    setPages([...pages, newPage]);
    setCurrentPage(pages.length);
  };

  const handlePageNameChange = (name) => {
    const updatedPages = [...pages];
    updatedPages[currentPage].name = name;
    setPages(updatedPages);
  };

  const handleDeletePage = (pageIndex) => {
    if (pages.length <= 1) {
      alert("En az bir sayfa olmalıdır!");
      return;
    }
    
    const updatedPages = pages.filter((_, index) => index !== pageIndex);
    
    // Kalan sayfaların isimlerini yeniden düzenle
    const renumberedPages = updatedPages.map((page, index) => ({
      ...page,
      name: `Page ${index + 1}`
    }));
    
    setPages(renumberedPages);
    
    // Eğer silinen sayfa currentPage ise, bir önceki sayfaya geç
    if (currentPage >= pageIndex) {
      setCurrentPage(Math.max(0, currentPage - 1));
    }
  };

  const selectedField = currentFields.find(f => f.id === selected);

  const handleSave = () => {
    if (!formatName.trim()) {
      alert("Lütfen format adı giriniz!");
      return;
    }

    const format = {
      name: formatName,
      pages,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (onSave) {
      onSave(format);
    } else {
      console.log("Saved format:", format);
      alert("Format JSON'u console'a yazıldı!");
    }
  };

  return (
    <div className="flex h-full gap-4 bg-gradient-to-br from-white to-muted/50">
      {/* Sol Panel */}
      <div className="w-64 min-w-56 border-r p-6 flex flex-col gap-6 bg-white rounded-xl shadow-md mt-6 ml-4 h-[90vh] self-start sticky top-6">
        <div className="flex items-center gap-2 text-lg font-bold mb-2">
          <span>Alan Ekle</span>
        </div>
        <div className="flex flex-col gap-3">
          {FIELD_TYPES.map(ft => (
            <Button 
              key={ft.type} 
              variant="outline" 
              className="flex items-center gap-2 py-3 text-base rounded-lg shadow-sm hover:bg-primary/10 transition-all" 
              onClick={() => handleAddField(ft.type)}
            >
              {ft.icon} {ft.label}
            </Button>
          ))}
        </div>
      </div>
      {/* Orta Builder */}
      <div className="flex-1 flex flex-col p-8 gap-4 items-center overflow-y-auto max-h-[90vh] min-h-[90vh]">
        <div className="flex gap-4 mb-6 items-center w-full max-w-2xl mx-auto">
          <Input placeholder="Format Adı" value={formatName} onChange={e => setFormatName(e.target.value)} className="w-64 rounded-lg" />
          <Button onClick={handleSave} variant="default" className="rounded-lg px-6 py-2 text-base">Kaydet</Button>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="icon" onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            {pages.map((page, index) => (
              <div key={page.id} className="flex items-center gap-1">
                <Button
                  variant={currentPage === index ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(index)}
                >
                  {page.name}
                </Button>
                {pages.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePage(index);
                    }}
                  >
                    ✕
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={handleAddPage}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="icon" onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))} disabled={currentPage === pages.length - 1}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
          {currentFields.length === 0 && <div className="text-muted-foreground text-center py-24 text-xl font-semibold rounded-lg border bg-white/70">Alan ekleyin…</div>}
          {currentFields.map((field, idx) => (
            <div
              key={field.id}
              className={`border rounded-xl bg-white shadow-md flex flex-col gap-2 p-4 relative group transition-all hover:shadow-lg ${selected === field.id ? "ring-2 ring-primary" : ""}`}
              onClick={() => setSelected(field.id)}
              style={{ opacity: selected === field.id ? 1 : 0.97, cursor: 'pointer' }}
              data-id={field.id}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">{FIELD_TYPES.find(t => t.type === field.type)?.icon}</span>
                <span className="text-xs text-muted-foreground font-semibold">{field.label}</span>
                <div className="ml-auto flex gap-1">
                  {idx > 0 && <Button size="icon" variant="ghost" className="rounded-full" onClick={e => {e.stopPropagation(); handleMoveField(idx, idx-1);}}>↑</Button>}
                  {idx < currentFields.length-1 && <Button size="icon" variant="ghost" className="rounded-full" onClick={e => {e.stopPropagation(); handleMoveField(idx, idx+1);}}>↓</Button>}
                  <Button size="icon" variant="destructive" className="rounded-full" onClick={e => {e.stopPropagation(); handleDeleteField(field.id);}}>✕</Button>
                </div>
              </div>
              <div className="p-3 bg-muted/40 rounded-lg">
                <FieldPreview field={field} />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Sağ Panel */}
      <div className="w-80 min-w-72 border-l p-6 bg-white rounded-xl shadow-md mt-6 mr-4 h-[90vh] self-start sticky top-6 flex flex-col">
        <div className="text-lg font-bold mb-4">Alan Özellikleri</div>
        {selectedField ? (
          <div className="flex flex-col gap-4 flex-1">
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
            <div className="mt-auto pt-4">
              <Button variant="destructive" className="w-full rounded-lg" onClick={() => handleDeleteField(selectedField.id)}>Alanı Sil</Button>
            </div>
          </div>
        ) : <div className="text-muted-foreground text-base">Bir alan seçin…</div>}
      </div>
    </div>
  );
} 