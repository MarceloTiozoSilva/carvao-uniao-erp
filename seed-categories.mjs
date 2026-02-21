import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const categories = [
  { name: 'Manutenção Frota' },
  { name: 'Despesas Diversas' },
  { name: 'Combustível' },
  { name: 'Funcionário' },
  { name: 'Logística/Fabricação' },
];

async function seedCategories() {
  let connection;
  try {
    connection = await mysql.createConnection(process.env.DATABASE_URL);
    
    console.log('Conectado ao banco de dados');
    
    // Limpar categorias existentes (opcional)
    // await connection.execute('DELETE FROM expense_categories');
    
    for (const category of categories) {
      try {
        await connection.execute(
          'INSERT INTO expense_categories (name, createdAt, updatedAt) VALUES (?, NOW(), NOW())',
          [category.name]
        );
        console.log(`✓ Categoria criada: ${category.name}`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⚠ Categoria já existe: ${category.name}`);
        } else {
          throw error;
        }
      }
    }
    
    console.log('\n✅ Categorias populadas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao popular categorias:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seedCategories();
