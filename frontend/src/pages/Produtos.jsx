import { useState, useEffect } from "react";
import API_URL from "../config";

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [quantidade, setQuantidade] = useState("");

  const [filtroNome, setFiltroNome] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function carregarProdutos() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/produtos`);

      if (!response.ok) {
        throw new Error("Erro ao carregar produtos");
      }

      const data = await response.json();
      setProdutos(data);
    } catch (err) {
      setError("Erro ao carregar produtos: " + err.message);
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  }

  async function salvarProduto() {
    if (!nome || !categoria || !quantidade) {
      alert("Preencha todos os campos");
      return;
    }

    const qtd = parseInt(quantidade);
    if (qtd < 0) {
      alert("Quantidade nao pode ser negativa");
      return;
    }

    try {
      const dados = {
        nome: nome,
        categoria: categoria,
        quantidade: qtd,
      };

      const response = await fetch(`${API_URL}/api/produtos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dados),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao salvar produto");
      }

      alert("Produto adicionado!");

      setNome("");
      setCategoria("");
      setQuantidade("");

      carregarProdutos();
    } catch (err) {
      alert("Erro: " + err.message);
    }
  }

  async function excluirProduto(produtoId, nomeProduto) {
    const confirmacao = confirm(
      `Tem certeza que deseja excluir "${nomeProduto}"?`
    );

    if (!confirmacao) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/produtos/${produtoId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao excluir produto");
      }

      alert("Produto excluido com sucesso!");
      carregarProdutos();
    } catch (err) {
      alert("Erro: " + err.message);
    }
  }

  function getStatusEstoque(quantidade) {
    if (quantidade === 0) {
      return { texto: "Sem estoque", cor: "text-red-600" };
    } else if (quantidade < 10) {
      return { texto: "Estoque baixo", cor: "text-yellow-600" };
    } else {
      return { texto: "Em estoque", cor: "text-green-600" };
    }
  }

  const categorias = ["Todas"];
  produtos.forEach((produto) => {
    if (!categorias.includes(produto.categoria)) {
      categorias.push(produto.categoria);
    }
  });

  const produtosFiltrados = produtos.filter((produto) => {
    const matchNome = produto.nome
      .toLowerCase()
      .includes(filtroNome.toLowerCase());
    const matchCategoria =
      filtroCategoria === "Todas" || produto.categoria === filtroCategoria;
    return matchNome && matchCategoria;
  });

  if (loading) {
    return (
      <div className="p-5">
        <h1 className="text-2xl font-bold mb-4">Produtos</h1>
        <p className="text-gray-600">Carregando produtos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5">
        <h1 className="text-2xl font-bold mb-4">Produtos</h1>
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={carregarProdutos}
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
        <h1 className="text-3xl font-bold text-emerald-600">
          Gerenciar Produtos
        </h1>
        <button
          onClick={carregarProdutos}
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
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded"
          >
            {categorias.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white p-5 rounded border mb-5">
        <h2 className="text-xl font-semibold text-gray-600 mb-4">
          Adicionar Novo Produto
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            placeholder="Nome do produto"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded"
          />

          <input
            type="text"
            placeholder="Categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded"
          />

          <input
            type="number"
            placeholder="Quantidade"
            min="0"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded"
          />
        </div>

        <button
          onClick={salvarProduto}
          className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-800"
        >
          Adicionar Produto
        </button>
      </div>

      <div className="bg-white p-4 rounded border mb-5">
        <h3 className="text-lg font-semibold mb-3">Resumo:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {produtosFiltrados.length}
            </div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {produtosFiltrados.filter((p) => p.quantidade >= 10).length}
            </div>
            <div className="text-sm text-gray-500">Bom estoque</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {produtosFiltrados.filter((p) => p.quantidade === 0).length}
            </div>
            <div className="text-sm text-gray-500">Sem estoque</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {
                produtosFiltrados.filter(
                  (p) => p.quantidade > 0 && p.quantidade < 10
                ).length
              }
            </div>
            <div className="text-sm text-gray-500">Estoque baixo</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded border">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-700">
            Lista de Produtos ({produtosFiltrados.length})
          </h2>
        </div>

        {produtosFiltrados.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Nenhum produto encontrado.</p>
          </div>
        ) : (
          <div className="p-4">
            {produtosFiltrados.map((produto) => {
              const status = getStatusEstoque(produto.quantidade);
              return (
                <div
                  key={produto.id}
                  className="border border-gray-200 rounded p-4 mb-3 bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {produto.nome}
                      <span className="text-sm text-gray-500 ml-2">
                        (ID: {produto.id})
                      </span>
                    </h3>

                    <button
                      onClick={() => excluirProduto(produto.id, produto.nome)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      Excluir
                    </button>
                  </div>

                  <p className="text-gray-600 mt-1">
                    <span className="font-medium">Categoria:</span>{" "}
                    {produto.categoria}
                  </p>
                  <p className="text-gray-600 mt-1">
                    <span className="font-medium">Quantidade:</span>{" "}
                    {produto.quantidade}
                  </p>
                  <p className={`text-sm font-medium mt-2 ${status.cor}`}>
                    Status: {status.texto}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Criado: {new Date(produto.created_at).toLocaleDateString()}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
