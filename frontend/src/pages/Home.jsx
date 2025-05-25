import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const [statusApi, setStatusApi] = useState("verificando");

  useEffect(() => {
    verificarApi();
  }, []);

  async function verificarApi() {
    try {
      const response = await fetch("/api/health");

      if (response.ok) {
        setStatusApi("conectado");
      } else {
        setStatusApi("erro");
      }
    } catch (error) {
      setStatusApi("desconectado");
      console.error("API nao disponivel:", error);
    }
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col justify-center items-center p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold text-purple-900 mb-8">
          Bem-vindo ao Fabrismart!
        </h1>

        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Sistema de gestao de estoque e equipe. Use os botoes abaixo para
          navegar pelas telas disponiveis.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/dashboard"
            className="bg-gray-200 text-gray-600 px-8 py-3 rounded text-lg hover:bg-cyan-500 hover:text-white transition-colors text-center"
          >
            Dashboard
          </Link>

          <Link
            to="/produtos"
            className="bg-gray-200 text-gray-600 px-8 py-3 rounded text-lg hover:bg-emerald-500 hover:text-white transition-colors text-center"
          >
            Produtos
          </Link>

          <Link
            to="/funcionarios"
            className="bg-gray-200 text-gray-600 px-8 py-3 rounded text-lg hover:bg-pink-500 hover:text-white transition-colors text-center"
          >
            Funcionários
          </Link>
        </div>

        <div className="mt-16">
          {statusApi === "verificando" && (
            <div className="inline-flex items-center bg-yellow-100 text-yellow-800 px-4 py-2 rounded text-sm">
              <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin mr-2"></div>
              Verificando conexao com API...
            </div>
          )}

          {statusApi === "conectado" && (
            <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Sistema conectado com API Flask
            </div>
          )}

          {(statusApi === "erro" || statusApi === "desconectado") && (
            <div className="inline-flex items-center bg-red-100 text-red-800 px-4 py-2 rounded text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
              API Flask nao disponivel
              <button
                onClick={verificarApi}
                className="ml-3 bg-red-200 px-2 py-1 rounded text-xs hover:bg-red-300"
              >
                Tentar novamente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
