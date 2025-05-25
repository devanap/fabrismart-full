import { useState, useEffect } from "react";
import API_URL from "../config";

export default function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cargo, setCargo] = useState("");

  const [filtroNome, setFiltroNome] = useState("");
  const [filtroCargo, setFiltroCargo] = useState("Todos");

  useEffect(() => {
    carregarFuncionarios();
  }, []);

  async function carregarFuncionarios() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/funcionarios`);

      if (!response.ok) {
        throw new Error("Erro ao carregar funcionarios");
      }

      const data = await response.json();
      setFuncionarios(data);
    } catch (err) {
      setError("Erro ao carregar funcionarios: " + err.message);
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  }

  async function salvarFuncionario() {
    if (!nome || !email || !cargo) {
      alert("Preencha todos os campos");
      return;
    }

    if (!email.includes("@")) {
      alert("Digite um email valido");
      return;
    }

    try {
      const dados = {
        nome: nome,
        email: email.toLowerCase(),
        cargo: cargo,
      };

      const response = await fetch(`${API_URL}/api/funcionarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dados),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao salvar funcionario");
      }

      alert("Funcionario adicionado!");

      setNome("");
      setEmail("");
      setCargo("");

      carregarFuncionarios();
    } catch (err) {
      alert("Erro: " + err.message);
    }
  }

  async function excluirFuncionario(funcionarioId, nomeFuncionario) {
    const confirmacao = confirm(
      `Tem certeza que deseja excluir "${nomeFuncionario}"?`
    );

    if (!confirmacao) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/funcionarios/${funcionarioId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao excluir funcionario");
      }

      alert("Funcionario excluido com sucesso!");
      carregarFuncionarios();
    } catch (err) {
      alert("Erro: " + err.message);
    }
  }

  const cargos = ["Todos"];
  funcionarios.forEach((funcionario) => {
    const cargoFunc = funcionario.cargo || "Sem cargo";
    if (!cargos.includes(cargoFunc)) {
      cargos.push(cargoFunc);
    }
  });

  const funcionariosFiltrados = funcionarios.filter((funcionario) => {
    const matchNome = funcionario.nome
      .toLowerCase()
      .includes(filtroNome.toLowerCase());
    const cargoFunc = funcionario.cargo || "Sem cargo";
    const matchCargo = filtroCargo === "Todos" || cargoFunc === filtroCargo;
    return matchNome && matchCargo;
  });

  if (loading) {
    return (
      <div className="p-5">
        <h1 className="text-2xl font-bold mb-4">Funcionários</h1>
        <p className="text-gray-600">Carregando funcionários...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5">
        <h1 className="text-2xl font-bold mb-4">Funcionários</h1>
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={carregarFuncionarios}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="p-5 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-3xl font-bold text-pink-600">
          Gerenciar Funcionários
        </h1>
        <button
          onClick={carregarFuncionarios}
          className="bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600"
        >
          Atualizar Lista
        </button>
      </div>

      <div className="mb-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <input
            type="text"
            placeholder="Filtrar por nome..."
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded"
          />

          <select
            value={filtroCargo}
            onChange={(e) => setFiltroCargo(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded"
          >
            {cargos.map((cargo) => (
              <option key={cargo} value={cargo}>
                {cargo}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white p-5 rounded border mb-5">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Adicionar Novo Funcionário
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <input
            type="text"
            placeholder="Nome completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded"
          />

          <select
            value={cargo}
            onChange={(e) => setCargo(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded"
          >
            <option value="">Selecione um cargo</option>
            <option value="Vendedor">Vendedor</option>
            <option value="Gerente">Gerente</option>
            <option value="Estoquista">Estoquista</option>
            <option value="Supervisor">Supervisor</option>
            <option value="Assistente">Assistente</option>
          </select>

          <button
            onClick={salvarFuncionario}
            className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-800"
          >
            Adicionar
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded border mb-5">
        <h3 className="text-lg font-semibold mb-3">Resumo da Equipe:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {/* Total sempre primeiro */}
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {funcionariosFiltrados.length}
            </div>
            <div className="text-sm text-gray-500">Total</div>
          </div>

          {Array.from(
            new Set(funcionariosFiltrados.map((f) => f.cargo || "Sem cargo"))
          )
            .sort()
            .map((cargo, index) => {
              const cores = [
                "text-cyan-600",
                "text-emerald-600",
                "text-yellow-500",
                "text-pink-600",
                "text-indigo-600",
              ];
              const quantidade = funcionariosFiltrados.filter(
                (f) => (f.cargo || "Sem cargo") === cargo
              ).length;

              return (
                <div key={cargo}>
                  <div
                    className={`text-2xl font-bold ${
                      cores[index % cores.length]
                    }`}
                  >
                    {quantidade}
                  </div>
                  <div className="text-sm text-gray-500">{cargo}s</div>
                </div>
              );
            })}
        </div>
      </div>

      <div className="bg-white rounded border">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-700">
            Lista de Funcionários ({funcionariosFiltrados.length})
          </h2>
        </div>

        {funcionariosFiltrados.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Nenhum funcionário encontrado.</p>
          </div>
        ) : (
          <div className="p-4">
            {funcionariosFiltrados.map((funcionario) => (
              <div
                key={funcionario.id}
                className="border border-gray-200 rounded p-4 mb-3 bg-gray-50"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {funcionario.nome}
                    <span className="text-sm text-gray-500 ml-2">
                      (ID: {funcionario.id})
                    </span>
                  </h3>

                  <button
                    onClick={() =>
                      excluirFuncionario(funcionario.id, funcionario.nome)
                    }
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                  >
                    Excluir
                  </button>
                </div>

                <p className="text-gray-600 mt-1">
                  <span className="font-medium">Email:</span>{" "}
                  {funcionario.email}
                </p>
                <p className="text-gray-600 mt-1">
                  <span className="font-medium">Cargo:</span>
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm ml-2">
                    {funcionario.cargo || "Sem cargo"}
                  </span>
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Criado:{" "}
                  {new Date(funcionario.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
