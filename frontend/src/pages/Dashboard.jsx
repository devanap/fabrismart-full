import { useState, useEffect } from "react";
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import API_URL from "../config";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/stats`);

      if (!response.ok) {
        throw new Error("Erro ao carregar dados");
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError("Erro ao carregar dashboard: " + err.message);
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  }

  const cores = ["#FF6B9D", "#4ECDC4", "#9C27B0", "#4CAF50", "#E91E63"];

  if (loading) {
    return (
      <div className="p-5">
        <h1 className="text-3xl font-bold text-purple-700 mb-5">Dashboard</h1>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dados...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5">
        <h1 className="text-3xl font-bold text-purple-700 mb-5">Dashboard</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          onClick={carregarDados}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-5">
        <h1 className="text-3xl font-bold text-purple-700 mb-5">Dashboard</h1>
        <div className="text-center py-8">
          <p className="text-gray-600">Nenhum dado disponivel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-3xl font-bold text-cyan-600">Dashboard</h1>
        <button
          onClick={carregarDados}
          className="bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600"
        >
          Atualizar Dados
        </button>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          Situação do Estoque
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 text-center gap-4 mb-6">
        <div className="bg-gradient-to-br from-pink-50 to-rose-100 rounded-lg p-4 border border-pink-200 shadow-sm">
          <h2 className="text-sm font-medium text-pink-700">Sem Estoque</h2>
          <p className="mt-1 text-3xl font-bold text-pink-600">
            {stats.produtos_sem_estoque || 0}
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-lg p-4 border border-amber-200 shadow-sm">
          <h2 className="text-sm font-medium text-amber-700">Estoque Baixo</h2>
          <p className="mt-1 text-3xl font-bold text-amber-600">
            {stats.produtos_estoque_baixo || 0}
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-100 rounded-lg p-4 border border-emerald-200 shadow-sm">
          <h2 className="text-sm font-medium text-emerald-700">
            Estoque Normal
          </h2>
          <p className="mt-1 text-3xl font-bold text-emerald-600">
            {stats.produtos_estoque_normal || 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 text-center gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <h2 className="text-sm font-medium text-gray-600">
            Total de Produtos
          </h2>
          <p className="mt-1 text-3xl font-bold text-cyan-600">
            {stats.total_produtos}
          </p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <h2 className="text-sm font-medium text-gray-600">
            Total de Funcionários
          </h2>
          <p className="mt-1 text-3xl font-bold text-cyan-600">
            {stats.total_funcionarios}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 text-center gap-5 mb-6">
        <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-lg p-4 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">
            Produtos por Categoria
          </h2>
          <div style={{ width: "100%", height: "300px" }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={stats.produtos_por_categoria}
                  dataKey="quantidade"
                  nameKey="categoria"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ categoria, quantidade }) =>
                    `${categoria}: ${quantidade}`
                  }
                >
                  {stats.produtos_por_categoria?.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={cores[index % cores.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-lg p-4 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">
            Funcionários por Cargo
          </h2>
          <div style={{ width: "100%", height: "300px" }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={stats.funcionarios_por_cargo}
                  dataKey="quantidade"
                  nameKey="cargo"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ cargo, quantidade }) => `${cargo}: ${quantidade}`}
                >
                  {stats.funcionarios_por_cargo?.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={cores[index % cores.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
