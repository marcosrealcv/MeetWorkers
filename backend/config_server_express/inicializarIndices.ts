import mongoose from 'mongoose';

export async function inicializarIndices(): Promise<void> {
  try {
    const db = mongoose.connection;
    const collection = db.collection('avisos_prestadores');

    // Obtener índices actuales
    const indices = await collection.listIndexes().toArray();
    const nombresIndices = indices.map((idx) => idx.name);

    console.log('🔍 Verificando índices en avisos_prestadores...');

    // Eliminar índices antiguos problemáticos
    const indicesAEliminar = [
      'prestador_id_1_trabajo_id_1',
      'prestador_id_1_reserva_id_1'
    ];

    for (const nombreIndice of indicesAEliminar) {
      if (nombresIndices.includes(nombreIndice)) {
        try {
          await collection.dropIndex(nombreIndice);
          console.log(`   ✓ Índice eliminado: ${nombreIndice}`);
        } catch (err) {
          console.log(`   ⚠️  No se pudo eliminar ${nombreIndice}`);
        }
      }
    }

    // Limpiar documentos duplicados con prestador_id "1" que no sean válidos
    const resultado = await collection.deleteMany({
      prestador_id: '1',
      $and: [
        {
          $or: [
            { tipo: 'trabajo', trabajo_id: { $in: [null, undefined] } },
            { tipo: 'reserva', reserva_id: { $in: [null, undefined] } }
          ]
        }
      ]
    });

    if (resultado.deletedCount > 0) {
      console.log(`   ✓ ${resultado.deletedCount} documentos duplicados eliminados`);
    }

    console.log('✅ Índices verificados y limpiados correctamente\n');
  } catch (error) {
    console.error('⚠️  Error al inicializar índices:', error instanceof Error ? error.message : error);
    // No fallar el servidor si hay un error secundario
  }
}
