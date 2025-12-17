import { DataSource } from 'typeorm';

export async function truncateAllTables(dataSource: DataSource) {
  const tables = (
    await dataSource.query(
      `
      SELECT table_name
      FROM information_schema.tables
      WHERE 
        table_schema = 'public' AND 
        table_type = 'BASE TABLE'
      `,
    )
  )
    .map((t: any) => `"${t.table_name}"`)
    .join(', ');

  if (tables)
    await dataSource.query(
      `TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE;`,
    );
}
