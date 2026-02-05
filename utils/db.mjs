// Create PostgreSQL Connection Pool here !
import * as pg from "pg";
const { Pool } = pg.default;

const connectionPool = new Pool({
  connectionString:
    "postgresql://postgres:Ajickalo@localhost:5432/backend-checkpoint-2",
});

export default connectionPool;
