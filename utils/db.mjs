// Create PostgreSQL Connection Pool here !
import * as pg from "pg";
const { Pool } = pg.default;

const connectionPool = new Pool({
  connectionString:
    "postgresql://postgres:Ajickalo@localhost:5432/backend-checkpoint",
});

export default connectionPool;
