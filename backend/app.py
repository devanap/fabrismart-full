# backend/app.py
# API Flask - experiencia intermediaria com APIs e validacao
from flask import Flask, request, jsonify
from flask_cors import CORS
from database import Database
import re
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Permite requisicoes do React

# Instancia da database
db = Database()

def validate_email(email):
    """Validacao de email - regex simples mas funcional"""
    if not email:
        return False
    
    # Pattern basico de email
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def clean_string(text):
    """Limpa string de entrada - experiencia com limpeza de dados"""
    if not text:
        return ""
    # Remove espacos e limita tamanho
    cleaned = text.strip()
    return cleaned[:200]  # Limita tamanho para seguranca

# Rota principal
@app.route('/')
def home():
    """Informacoes da API"""
    try:
        stats = db.get_stats()
        
        return jsonify({
            'message': 'API Fabrismart funcionando',
            'timestamp': datetime.now().isoformat(),
            'database': 'SQLite',
            'produtos': stats['total_produtos'],
            'funcionarios': stats['total_funcionarios'],
            'endpoints': [
                'GET /api/produtos',
                'POST /api/produtos',
                'PUT /api/produtos/{id}',
                'DELETE /api/produtos/{id}',
                'GET /api/funcionarios',
                'POST /api/funcionarios',
                'PUT /api/funcionarios/{id}',
                'DELETE /api/funcionarios/{id}',
                'GET /api/stats'
            ]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Health check
@app.route('/api/health')
def health_check():
    """Verifica se API esta funcionando"""
    try:
        # Testa database
        stats = db.get_stats()
        return jsonify({
            'status': 'ok',
            'database': 'connected',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

# PRODUTOS - CRUD completo
@app.route('/api/produtos', methods=['GET'])
def listar_produtos():
    """Lista todos os produtos"""
    try:
        produtos = db.get_produtos()
        return jsonify(produtos)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/produtos', methods=['POST'])
def criar_produto():
    """Cria novo produto"""
    try:
        dados = request.get_json()
        
        # Validacao basica
        if not dados:
            return jsonify({'error': 'Nenhum dado fornecido'}), 400
        
        # Extrai e limpa dados
        nome = clean_string(dados.get('nome', ''))
        categoria = clean_string(dados.get('categoria', ''))
        quantidade = dados.get('quantidade', 0)
        
        # Validacoes
        if not nome:
            return jsonify({'error': 'Nome eh obrigatorio'}), 400
        
        if not categoria:
            return jsonify({'error': 'Categoria eh obrigatoria'}), 400
        
        # Valida quantidade
        try:
            quantidade = int(quantidade)
            if quantidade < 0:
                return jsonify({'error': 'Quantidade nao pode ser negativa'}), 400
        except (ValueError, TypeError):
            return jsonify({'error': 'Quantidade deve ser um numero'}), 400
        
        # Tenta criar produto
        try:
            produto_id = db.create_produto(nome, categoria, quantidade)
            produto = db.get_produto_by_id(produto_id)
            return jsonify(produto), 201
            
        except Exception as e:
            # Verifica se eh erro de duplicata
            if 'UNIQUE constraint failed' in str(e):
                return jsonify({'error': 'Produto ja existe nesta categoria'}), 409
            else:
                return jsonify({'error': 'Erro ao criar produto'}), 500
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/produtos/<int:produto_id>', methods=['PUT'])
def atualizar_produto(produto_id):
    """Atualiza produto existente"""
    try:
        # Verifica se produto existe
        produto = db.get_produto_by_id(produto_id)
        if not produto:
            return jsonify({'error': 'Produto nao encontrado'}), 404
        
        dados = request.get_json()
        if not dados:
            return jsonify({'error': 'Nenhum dado fornecido'}), 400
        
        # Extrai e valida dados
        nome = clean_string(dados.get('nome', ''))
        categoria = clean_string(dados.get('categoria', ''))
        quantidade = dados.get('quantidade', 0)
        
        if not nome or not categoria:
            return jsonify({'error': 'Nome e categoria sao obrigatorios'}), 400
        
        try:
            quantidade = int(quantidade)
            if quantidade < 0:
                return jsonify({'error': 'Quantidade nao pode ser negativa'}), 400
        except:
            return jsonify({'error': 'Quantidade deve ser um numero'}), 400
        
        # Atualiza produto
        db.update_produto(produto_id, nome, categoria, quantidade)
        produto_atualizado = db.get_produto_by_id(produto_id)
        
        return jsonify(produto_atualizado)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/produtos/<int:produto_id>', methods=['DELETE'])
def excluir_produto(produto_id):
    """Exclui produto"""
    try:
        # Verifica se existe
        produto = db.get_produto_by_id(produto_id)
        if not produto:
            return jsonify({'error': 'Produto nao encontrado'}), 404
        
        db.delete_produto(produto_id)
        return jsonify({'message': 'Produto excluido com sucesso'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# FUNCIONARIOS - CRUD completo
@app.route('/api/funcionarios', methods=['GET'])
def listar_funcionarios():
    """Lista funcionarios"""
    try:
        funcionarios = db.get_funcionarios()
        return jsonify(funcionarios)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/funcionarios', methods=['POST'])
def criar_funcionario():
    """Cria novo funcionario"""
    try:
        dados = request.get_json()
        
        if not dados:
            return jsonify({'error': 'Nenhum dado fornecido'}), 400
        
        # Extrai dados
        nome = clean_string(dados.get('nome', ''))
        email = clean_string(dados.get('email', '')).lower()  # Email sempre minusculo
        cargo = clean_string(dados.get('cargo', ''))
        
        # Validacoes
        if not nome:
            return jsonify({'error': 'Nome eh obrigatorio'}), 400
        
        if not email:
            return jsonify({'error': 'Email eh obrigatorio'}), 400
        
        # Valida formato do email
        if not validate_email(email):
            return jsonify({'error': 'Email invalido'}), 400
        
        # Tenta criar funcionario
        try:
            funcionario_id = db.create_funcionario(nome, email, cargo)
            funcionario = db.get_funcionario_by_id(funcionario_id)
            return jsonify(funcionario), 201
            
        except Exception as e:
            if 'UNIQUE constraint failed' in str(e):
                return jsonify({'error': 'Email ja cadastrado'}), 409
            else:
                return jsonify({'error': 'Erro ao criar funcionario'}), 500
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/funcionarios/<int:funcionario_id>', methods=['PUT'])
def atualizar_funcionario(funcionario_id):
    """Atualiza funcionario"""
    try:
        # Verifica se existe
        funcionario = db.get_funcionario_by_id(funcionario_id)
        if not funcionario:
            return jsonify({'error': 'Funcionario nao encontrado'}), 404
        
        dados = request.get_json()
        if not dados:
            return jsonify({'error': 'Nenhum dado fornecido'}), 400
        
        # Valida dados
        nome = clean_string(dados.get('nome', ''))
        email = clean_string(dados.get('email', '')).lower()
        cargo = clean_string(dados.get('cargo', ''))
        
        if not nome or not email:
            return jsonify({'error': 'Nome e email sao obrigatorios'}), 400
        
        if not validate_email(email):
            return jsonify({'error': 'Email invalido'}), 400
        
        # Atualiza
        try:
            db.update_funcionario(funcionario_id, nome, email, cargo)
            funcionario_atualizado = db.get_funcionario_by_id(funcionario_id)
            return jsonify(funcionario_atualizado)
            
        except Exception as e:
            if 'UNIQUE constraint failed' in str(e):
                return jsonify({'error': 'Email ja usado por outro funcionario'}), 409
            else:
                raise e
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/funcionarios/<int:funcionario_id>', methods=['DELETE'])
def excluir_funcionario(funcionario_id):
    """Exclui funcionario"""
    try:
        funcionario = db.get_funcionario_by_id(funcionario_id)
        if not funcionario:
            return jsonify({'error': 'Funcionario nao encontrado'}), 404
        
        db.delete_funcionario(funcionario_id)
        return jsonify({'message': 'Funcionario excluido com sucesso'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ESTATISTICAS para dashboard
@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Retorna estatisticas do sistema"""
    try:
        stats = db.get_stats()
        
        # Adiciona contadores extras para o frontend
        for item in stats['status_estoque']:
            if item['status'] == 'Sem Estoque':
                stats['produtos_sem_estoque'] = item['quantidade']
            elif item['status'] == 'Estoque Baixo':
                stats['produtos_estoque_baixo'] = item['quantidade']
            elif item['status'] == 'Estoque Normal':
                stats['produtos_estoque_normal'] = item['quantidade']
        
        return jsonify(stats)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Error handlers basicos
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint nao encontrado'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Erro interno do servidor'}), 500

if __name__ == '__main__':
    print("Iniciando API Flask...")
    print("Endpoints disponiveis:")
    print("  GET    /api/produtos")
    print("  POST   /api/produtos")
    print("  PUT    /api/produtos/{id}")
    print("  DELETE /api/produtos/{id}")
    print("  GET    /api/funcionarios")
    print("  POST   /api/funcionarios")
    print("  PUT    /api/funcionarios/{id}")
    print("  DELETE /api/funcionarios/{id}")
    print("  GET    /api/stats")
    print("")
    print("Rodando em: http://localhost:5000")
    
    app.run(debug=True, port=5000)
