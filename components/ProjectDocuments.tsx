"use client";

import { useEffect, useState } from "react";
import { Upload, Download, Trash2, FileText, History } from "lucide-react";

type Doc = {
  id: string;
  groupId: string;
  categoria: string;
  nome: string;
  tipo: string;
  tamanho: number;
  versao: number;
  visivelCliente: boolean;
  createdAt: string;
};

const CATEGORIAS = [
  "Contratos",
  "Projetos",
  "Plantas",
  "Laudos",
  "ART/RRT/TRT",
  "Memoriais",
  "Relatórios",
  "Fotos",
  "Documentos do cliente",
  "Entregas",
  "Outros",
];

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ProjectDocuments({ projectId }: { projectId: string }) {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoria, setCategoria] = useState("Outros");
  const [visivelCliente, setVisivelCliente] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  function load() {
    fetch(`/api/projects/${projectId}/documents`)
      .then((r) => r.json())
      .then((data) => {
        setDocs(data.documents || []);
        setLoading(false);
      });
  }

  useEffect(() => {
    load();
  }, [projectId]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>, groupId?: string) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setError("Arquivo maior que 4MB. Escolha um arquivo menor.");
      return;
    }
    setError(null);
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const res = await fetch(`/api/projects/${projectId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: file.name,
          tipo: file.type || "application/octet-stream",
          conteudo: reader.result,
          categoria,
          groupId,
          visivelCliente,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao enviar arquivo.");
      } else {
        load();
      }
      setUploading(false);
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta versão do documento?")) return;
    await fetch(`/api/documents/${id}`, { method: "DELETE" });
    load();
  }

  if (loading) return <p className="text-sm text-slate-400">Carregando documentos...</p>;

  const groups = Array.from(new Set(docs.map((d) => d.groupId))).map((groupId) => {
    const versions = docs.filter((d) => d.groupId === groupId).sort((a, b) => b.versao - a.versao);
    return { groupId, latest: versions[0], versions };
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-md"
        >
          {CATEGORIAS.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <label className="flex items-center gap-1.5 text-xs text-slate-600">
          <input type="checkbox" checked={visivelCliente} onChange={(e) => setVisivelCliente(e.target.checked)} />
          Visível ao cliente
        </label>
        <label className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md cursor-pointer">
          <Upload size={16} />
          {uploading ? "Enviando..." : "Enviar documento"}
          <input type="file" className="hidden" onChange={(e) => handleUpload(e)} disabled={uploading} />
        </label>
      </div>

      {error && (
        <div className="text-sm text-rose-700 bg-rose-50 border-l-4 border-rose-300 px-3 py-2 rounded-r-md">{error}</div>
      )}

      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
        {groups.map(({ groupId, latest, versions }) => (
          <div key={groupId}>
            <div className="flex items-center gap-3 px-4 py-3">
              <FileText size={18} className="text-slate-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-900 truncate">{latest.nome}</div>
                <div className="text-xs text-slate-400">
                  {latest.categoria} · {formatSize(latest.tamanho)} · v{latest.versao}
                  {latest.visivelCliente && <span className="ml-2 text-emerald-600">· Visível ao cliente</span>}
                </div>
              </div>
              <a href={`/api/documents/${latest.id}/download`} className="text-slate-400 hover:text-blue-600 p-1">
                <Download size={16} />
              </a>
              <label className="text-slate-400 hover:text-blue-600 p-1 cursor-pointer" title="Enviar nova versão">
                <History size={16} />
                <input type="file" className="hidden" onChange={(e) => handleUpload(e, groupId)} disabled={uploading} />
              </label>
              <button onClick={() => handleDelete(latest.id)} className="text-slate-400 hover:text-rose-500 p-1">
                <Trash2 size={16} />
              </button>
            </div>
            {versions.length > 1 && (
              <div className="px-4 pb-2">
                <button
                  onClick={() => setExpandedGroup(expandedGroup === groupId ? null : groupId)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  {expandedGroup === groupId ? "Ocultar versões anteriores" : `Ver ${versions.length - 1} versão(ões) anterior(es)`}
                </button>
                {expandedGroup === groupId && (
                  <div className="mt-2 space-y-1 pl-6 border-l-2 border-slate-100">
                    {versions.slice(1).map((v) => (
                      <div key={v.id} className="flex items-center justify-between text-xs text-slate-500">
                        <span>
                          v{v.versao} · {new Date(v.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                        <a href={`/api/documents/${v.id}/download`} className="text-blue-600 hover:underline">
                          Baixar
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {groups.length === 0 && <p className="text-sm text-slate-400 text-center py-8">Nenhum documento enviado ainda.</p>}
      </div>
    </div>
  );
}
