import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'localhost',
  user: process.env.DATABASE_URL?.split('//')[1]?.split(':')[0] || 'root',
  password: process.env.DATABASE_URL?.split(':')[1]?.split('@')[0] || '',
  database: process.env.DATABASE_URL?.split('/')[3]?.split('?')[0] || 'test',
});

try {
  console.log('Limpando dados de seed...');
  
  // Desabilitar foreign key checks
  await connection.execute('SET FOREIGN_KEY_CHECKS=0');
  
  // Limpar tabelas
  await connection.execute('DELETE FROM stock_movements');
  await connection.execute('DELETE FROM accounts');
  await connection.execute('DELETE FROM suppliers');
  await connection.execute('DELETE FROM products');
  await connection.execute('DELETE FROM clients');
  await connection.execute('DELETE FROM expenses');
  await connection.execute('DELETE FROM sales');
  
  // Reabilitar foreign key checks
  await connection.execute('SET FOREIGN_KEY_CHECKS=1');
  
  console.log('✅ Todos os dados foram removidos com sucesso!');
} catch (error) {
  console.error('❌ Erro ao limpar dados:', error);
} finally {
  await connection.end();
}
