import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: "postgresql",
  dbCredentials: {
    host: "localhost",
    port: 3000,
    user: "user",
    password: "password",
    database: "dbname",
    ssl: false  
  }
})