import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default {
  type: 'postgres',
  host: 'ems-dev-1.cerolakcfaav.us-east-2.rds.amazonaws.com',
  port: 5432,
  username: 'emsdev',
  password: 'QpU7FafZPqnu',
  database: 'ems',
  ssl: true,
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: true,
  migrations: ['dist/migration/*.js'],
  migrationsTableName: 'migrations_typeorm',
  migrationsRun: false,
  cli: {
    migrationsDir: 'src/migration',
  },
  timezone: '+0',
  maxQueryExecutionTime: 1000,
  logging: true,
  logger: 'file',
} as TypeOrmModuleOptions;
