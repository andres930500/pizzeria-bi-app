require("dotenv/config");
const { Client } = require("pg");
const xlsx = require("xlsx");

// 1. CONFIGURACIÓN: usa DATABASE_URL desde variables de entorno
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL no esta definida en el entorno.");
  process.exit(1);
}

const client = new Client({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }, // Requerido para conexiones seguras con Neon
});

async function migrarDatos() {
  try {
    await client.connect();
    console.log("🚀 Conexión exitosa a Neon PostgreSQL.");

    // Leer el archivo Excel
    const workbook = xlsx.readFile("./Analisis_Pizzeria_V2.xlsx");

    // Listado de tus hojas (Tablas)
    const hojas = [
      "Dim_Date",
      "Dim_Time",
      "Dim_Location",
      "Dim_Pizza_Type",
      "Dim_Pizza",
      "Fact_Sales",
    ];

    for (const nombreHoja of hojas) {
      console.log(`\n--- Procesando tabla: ${nombreHoja} ---`);
      const datos = xlsx.utils.sheet_to_json(workbook.Sheets[nombreHoja]);

      if (datos.length === 0) {
        console.log(`⚠️ La hoja ${nombreHoja} está vacía. Saltando...`);
        continue;
      }

      // Crear la tabla automáticamente basándose en las columnas del Excel
      const columnasIdentificadores = Object.keys(datos[0]);
      const definicionColumnas = columnasIdentificadores
        .map((col) => `"${col}" TEXT`) // Usamos TEXT para evitar errores de tipo inicialmente
        .join(", ");

      await client.query(
        `CREATE TABLE IF NOT EXISTS "${nombreHoja}" (${definicionColumnas});`,
      );

      // Limpiar la tabla antes de insertar (para evitar duplicados si re-ejecutas)
      await client.query(`TRUNCATE TABLE "${nombreHoja}";`);

      console.log(`Subiendo ${datos.length} registros...`);

      // Inserción por lotes (Chunks) de 1000 en 1000
      const tamañoLote = 1000;
      for (let i = 0; i < datos.length; i += tamañoLote) {
        const lote = datos.slice(i, i + tamañoLote);
        const llaves = Object.keys(lote[0]);

        // Construcción de la consulta SQL masiva
        const consultaBase = `INSERT INTO "${nombreHoja}" ("${llaves.join('", "')}") VALUES `;
        const valores = [];
        const marcadores = lote
          .map((fila, indiceFila) => {
            const filaMarcadores = llaves.map((_, indiceCol) => {
              valores.push(fila[llaves[indiceCol]]);
              return `$${indiceFila * llaves.length + indiceCol + 1}`;
            });
            return `(${filaMarcadores.join(", ")})`;
          })
          .join(", ");

        await client.query(consultaBase + marcadores, valores);
        process.stdout.write(
          `✅ Registros procesados: ${i + lote.length} / ${datos.length}\r`,
        );
      }
    }

    console.log(
      "\n\n✨ ¡Migración terminada con éxito! Todos los datos están en Neon.",
    );
  } catch (error) {
    console.error("\n❌ Error durante la migración:", error);
  } finally {
    await client.end();
  }
}

migrarDatos();
