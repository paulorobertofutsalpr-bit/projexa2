type CompanyInfo = {
  name: string;
  document?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  logoData?: string | null;
};

type ClientInfo = {
  nome: string;
  tipo?: string | null;
  documento?: string | null;
  telefone?: string | null;
  email?: string | null;
  endereco?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
};

export default function ContractPartiesHeader({ company, client }: { company: CompanyInfo; client: ClientInfo }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            {company.logoData ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logoData} alt={company.name} className="w-8 h-8 rounded object-contain" />
            ) : (
              <div className="w-8 h-8 rounded bg-blue-600 text-white flex items-center justify-center font-semibold text-xs">
                Pj
              </div>
            )}
            <h3 className="text-xs uppercase tracking-wide text-slate-400">Contratado</h3>
          </div>
          <div className="text-sm space-y-1">
            <div className="font-medium text-slate-900">{company.name}</div>
            {company.document && <div className="text-slate-600">{company.document}</div>}
            {company.address && (
              <div className="text-slate-600">
                {company.address}
                {company.city ? ` — ${company.city}/${company.state ?? ""}` : ""}
              </div>
            )}
            {company.phone && <div className="text-slate-600">{company.phone}</div>}
            {company.email && <div className="text-slate-600">{company.email}</div>}
          </div>
        </div>
        <div className="p-5">
          <h3 className="text-xs uppercase tracking-wide text-slate-400 mb-3">Contratante</h3>
          <div className="text-sm space-y-1">
            <div className="font-medium text-slate-900">{client.nome}</div>
            {client.documento && <div className="text-slate-600">{client.documento}</div>}
            {(client.endereco || client.bairro) && (
              <div className="text-slate-600">
                {[client.endereco, client.bairro].filter(Boolean).join(", ")}
              </div>
            )}
            {(client.cidade || client.cep) && (
              <div className="text-slate-600">
                {client.cidade ? `${client.cidade}/${client.estado ?? ""}` : ""}
                {client.cep ? ` — CEP ${client.cep}` : ""}
              </div>
            )}
            {client.telefone && <div className="text-slate-600">{client.telefone}</div>}
            {client.email && <div className="text-slate-600">{client.email}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
