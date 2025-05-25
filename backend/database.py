import sqlite3
import os
from datetime import datetime

class Database:
    def __init__(self, db_file='fabrismart.db'):
        self.db_file = db_file
        self.init_database()
    
    def init_database(self):
        """Cria tabelas se nao existirem - similar a create table no SQL"""
        conn = sqlite3.connect(self.db_file)
        cursor = conn.cursor()
        
        # Tabela produtos
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS produtos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                categoria TEXT NOT NULL,
                quantidade INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(nome, categoria)
            )
        ''')
        
        # Tabela funcionários
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS funcionarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                cargo TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
        print(f"Database inicializado: {self.db_file}")
    
    def execute_query(self, query, params=None):
        """Executa query SQL"""
        conn = sqlite3.connect(self.db_file)
        cursor = conn.cursor()
        
        try:
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            
            # Se for SELECT, retorna dados
            if query.strip().upper().startswith('SELECT'):
                # Converte para lista de dicts
                columns = [description[0] for description in cursor.description]
                rows = cursor.fetchall()
                result = []
                for row in rows:
                    result.append(dict(zip(columns, row)))
                return result
            else:
                conn.commit()
                return cursor.lastrowid
                
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
    
    # Metodos para produtos
    def get_produtos(self):
        """Lista todos os produtos - query SQL simples"""
        query = """
            SELECT id, nome, categoria, quantidade, created_at
            FROM produtos 
            ORDER BY nome
        """
        return self.execute_query(query)
    
    def get_produto_by_id(self, produto_id):
        """Busca produto por ID"""
        query = "SELECT * FROM produtos WHERE id = ?"
        result = self.execute_query(query, (produto_id,))
        return result[0] if result else None
    
    def create_produto(self, nome, categoria, quantidade):
        """Cria novo produto"""
        query = "INSERT INTO produtos (nome, categoria, quantidade) VALUES (?, ?, ?)"
        return self.execute_query(query, (nome, categoria, quantidade))
    
    def update_produto(self, produto_id, nome, categoria, quantidade):
        """Atualiza produto"""
        query = "UPDATE produtos SET nome = ?, categoria = ?, quantidade = ? WHERE id = ?"
        self.execute_query(query, (nome, categoria, quantidade, produto_id))
    
    def delete_produto(self, produto_id):
        """Remove produto"""
        query = "DELETE FROM produtos WHERE id = ?"
        self.execute_query(query, (produto_id,))
    
    # Metodos para funcionarios
    def get_funcionarios(self):
        """Lista funcionarios"""
        query = """
            SELECT id, nome, email, cargo, created_at
            FROM funcionarios 
            ORDER BY nome
        """
        return self.execute_query(query)
    
    def get_funcionario_by_id(self, funcionario_id):
        """Busca funcionario por ID"""
        query = "SELECT * FROM funcionarios WHERE id = ?"
        result = self.execute_query(query, (funcionario_id,))
        return result[0] if result else None
    
    def create_funcionario(self, nome, email, cargo):
        """Cria funcionario"""
        query = "INSERT INTO funcionarios (nome, email, cargo) VALUES (?, ?, ?)"
        return self.execute_query(query, (nome, email, cargo))
    
    def update_funcionario(self, funcionario_id, nome, email, cargo):
        """Atualiza funcionario"""
        query = "UPDATE funcionarios SET nome = ?, email = ?, cargo = ? WHERE id = ?"
        self.execute_query(query, (nome, email, cargo, funcionario_id))
    
    def delete_funcionario(self, funcionario_id):
        """Remove funcionario"""
        query = "DELETE FROM funcionarios WHERE id = ?"
        self.execute_query(query, (funcionario_id,))
    
    def get_stats(self):
        """Calcula estatisticas"""
        stats = {}
        
        # Total de produtos
        query = "SELECT COUNT(*) as total FROM produtos"
        result = self.execute_query(query)
        stats['total_produtos'] = result[0]['total']
        
        # Total de funcionarios
        query = "SELECT COUNT(*) as total FROM funcionarios"
        result = self.execute_query(query)
        stats['total_funcionarios'] = result[0]['total']
        
        # Produtos por categoria
        query = """
            SELECT categoria, COUNT(*) as quantidade 
            FROM produtos 
            GROUP BY categoria
            ORDER BY quantidade DESC
        """
        stats['produtos_por_categoria'] = self.execute_query(query)
        
        # Funcionarios por cargo
        query = """
            SELECT 
                CASE WHEN cargo IS NULL OR cargo = '' THEN 'Sem cargo' ELSE cargo END as cargo,
                COUNT(*) as quantidade 
            FROM funcionarios 
            GROUP BY cargo
            ORDER BY quantidade DESC
        """
        stats['funcionarios_por_cargo'] = self.execute_query(query)
        
        # Status do estoque - CASE WHEN como em SQL tradicional
        query = """
            SELECT 
                SUM(CASE WHEN quantidade = 0 THEN 1 ELSE 0 END) as sem_estoque,
                SUM(CASE WHEN quantidade > 0 AND quantidade < 10 THEN 1 ELSE 0 END) as estoque_baixo,
                SUM(CASE WHEN quantidade >= 10 THEN 1 ELSE 0 END) as estoque_normal
            FROM produtos
        """
        result = self.execute_query(query)
        
        if result:
            estoque = result[0]
            stats['status_estoque'] = [
                {'status': 'Sem Estoque', 'quantidade': estoque['sem_estoque'] or 0},
                {'status': 'Estoque Baixo', 'quantidade': estoque['estoque_baixo'] or 0},
                {'status': 'Estoque Normal', 'quantidade': estoque['estoque_normal'] or 0}
            ]
        
        # Total de categorias
        query = "SELECT COUNT(DISTINCT categoria) as total FROM produtos"
        result = self.execute_query(query)
        stats['total_categorias'] = result[0]['total']
              
        return stats
    
    def backup_data(self):
        """Backup simples - experiencia com automacao"""
        import json
        
        dados = {
            'produtos': self.get_produtos(),
            'funcionarios': self.get_funcionarios(),
            'backup_date': datetime.now().isoformat()
        }
        
        filename = f'backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(dados, f, indent=2, ensure_ascii=False, default=str)
        
        print(f"Backup salvo: {filename}")
        return filename

# Função para popular dados iniciais
def criar_dados_teste():
    """Cria dados de teste - como faria em automacao/scripts"""
    db = Database()
    
    # Lista de produtos para teste
    produtos = [
        ("Notebook Dell", "Eletronicos", 5),
        ("Mouse Logitech", "Eletronicos", 15),
        ("Teclado Mecanico", "Eletronicos", 0),
        ("Camisa Polo", "Roupas", 20),
        ("Calca Jeans", "Roupas", 8),
        ("Arroz 5kg", "Alimentos", 50),
    ]
    
    # Lista de funcionarios
    funcionarios = [
        ("Joao Silva", "joao@empresa.com", "Vendedor"),
        ("Maria Santos", "maria@empresa.com", "Gerente"),
        ("Pedro Costa", "pedro@empresa.com", "Estoquista"),
    ]
    
    try:
        # Insere produtos
        for nome, categoria, quantidade in produtos:
            try:
                db.create_produto(nome, categoria, quantidade)
            except:
                pass  # Ignora duplicatas
        
        # Insere funcionarios
        for nome, email, cargo in funcionarios:
            try:
                db.create_funcionario(nome, email, cargo)
            except:
                pass  # Ignora duplicatas
        
        print("Dados de teste criados!")
        return True
        
    except Exception as e:
        print(f"Erro ao criar dados: {e}")
        return False

if __name__ == "__main__":
    print("Inicializando banco de dados...")
    db = Database()
    
    # Pergunta se quer criar dados de exemplo
    resposta = input("Criar dados de exemplo? (s/n): ").lower()
    if resposta == 's':
        criar_dados_teste()
    
    print("Database pronto!")
