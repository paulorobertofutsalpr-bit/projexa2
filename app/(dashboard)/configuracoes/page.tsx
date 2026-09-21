"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, CreditCard } from "lucide-react";

type Company = {
  name: string;
  document: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  website: string | null;
  logoData: string | null;
};

export default function ConfiguracoesPage() {
  const router = useRouter();
  const [form, setForm] = useState<Company>({
    name: "",
    document: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    website: "",
    logoData: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/company")
      .then((r) => r.json())
      .then((data) => {
        if (data.company) {
          setForm({
            name: data.company.name || "",
            document: data.company.document || "",
            phone: data.company.phone || "",
            email: data.company.email || "",
            address: data.company.address || "",
            city: data.company.city || "",
            state: data.company.state || "",
            website: data.company.website || "",
            logoData: data.company.logoData || null,
          });
        }
        setLoading(false);
      });
  }, []);

  function update(k: keyof Company, v: string) {
    setForm((prev) => ({ ...prev, [k]: v }));
    setSaved(false);
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setError("A imagem deve ter no máximo 1MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, logoData: reader.result as string }));
      setSaved(false);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const res = await fetch("/api/company", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erro ao salvar.");
      setSaving(false);
      return;
    }
    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  const inputClass =
    "w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";

  if (loading) {
    return <p className="text-sm text-slate-400">Carregando...</p>;
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Configurações da empresa</h1>
        <p className="text-slate-500 text-sm mt-1">
          Esses dados aparecem na logomarca do sistema e no cabeçalho dos orçamentos e propostas.
        </p>
      </div>

      <Link
        href="/assinatura"
        className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-4 hover:border-blue-300"
      >
        <div className="flex items-center gap-3">
          <CreditCard size={18} className="text-slate-400" />
          <div>
            <div className="text-sm font-medium text-slate-900">Assinatura</div>
            <div className="text-xs text-slate-500">Ver status do pagamento e regularizar, se necessário</div>
          </div>
        </div>
        <span className="text-slate-300">→</span>
      </Link>

      <Link
        href="/configuracoes/usuarios"
        className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-4 hover:border-blue-300"
      >
        <div className="flex items-center gap-3">
          <Users size={18} className="text-slate-400" />
          <div>
            <div className="text-sm font-medium text-slate-900">Usuários</div>
            <div className="text-xs text-slate-500">Cadastrar e gerenciar quem acessa o sistema</div>
          </div>
        </div>
        <span className="text-slate-300">→</span>
      </Link>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
        {error && (
          <div className="text-sm text-rose-700 bg-rose-50 border-l-4 border-rose-300 px-3 py-2 rounded-r-md">
            {error}
          </div>
        )}
        {saved && (
          <div className="text-sm text-emerald-700 bg-emerald-50 border-l-4 border-emerald-300 px-3 py-2 rounded-r-md">
            Dados salvos com sucesso.
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-2">Logomarca</label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-md border border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50">
              {form.logoData ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.logoData} alt="Logomarca" className="w-full h-full object-contain" />
              ) : (
                <span className="text-slate-300 text-xs">Sem logo</span>
              )}
            </div>
            <input type="file" accept="image/*" onChange={handleLogoChange} className="text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Nome / Razão social</label>
          <input required value={form.name} onChange={(e) => update("name", e.target.value)} className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">CNPJ/CPF</label>
            <input value={form.document || ""} onChange={(e) => update("document", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Telefone</label>
            <input value={form.phone || ""} onChange={(e) => update("phone", e.target.value)} className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">E-mail</label>
            <input type="email" value={form.email || ""} onChange={(e) => update("email", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Site</label>
            <input value={form.website || ""} onChange={(e) => update("website", e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Endereço</label>
          <input value={form.address || ""} onChange={(e) => update("address", e.target.value)} className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Cidade</label>
            <input value={form.city || ""} onChange={(e) => update("city", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Estado</label>
            <input maxLength={2} value={form.state || ""} onChange={(e) => update("state", e.target.value)} className={inputClass} />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
