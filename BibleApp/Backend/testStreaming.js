// Script de prueba para verificar el streaming real
// Ejecutar con: node testStreaming.js

import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000/api';

async function testStreaming() {
    console.log('🧪 Iniciando prueba de streaming...\n');

    const testVerse = {
        verse: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.",
        bookName: "Juan",
        chapter: 3,
        verseNumber: 16,
        type: "aplicacionDiaria",
        translationValue: "spa_r09",
        bookId: "jhn"
    };

    try {
        const startTime = Date.now();
        let firstChunkTime = null;
        let chunkCount = 0;
        let totalText = '';

        console.log('📤 Enviando solicitud...');
        const response = await fetch(`${BASE_URL}/ai/explain-verse-stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testVerse),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('✅ Conexión establecida, esperando chunks...\n');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();

            if (done) {
                break;
            }

            const chunk = decoder.decode(value, { stream: true });

            if (!firstChunkTime) {
                firstChunkTime = Date.now();
                const timeToFirstChunk = firstChunkTime - startTime;
                console.log(`⚡ PRIMER CHUNK RECIBIDO en ${timeToFirstChunk}ms\n`);
                console.log('📝 Contenido streaming:\n');
            }

            chunkCount++;
            totalText += chunk;
            process.stdout.write(chunk); // Mostrar en tiempo real
        }

        const endTime = Date.now();
        const totalTime = endTime - startTime;
        const timeToFirstChunk = firstChunkTime - startTime;

        console.log('\n\n' + '='.repeat(60));
        console.log('📊 RESULTADOS DE LA PRUEBA');
        console.log('='.repeat(60));
        console.log(`⏱️  Tiempo hasta primer chunk: ${timeToFirstChunk}ms`);
        console.log(`⏱️  Tiempo total: ${totalTime}ms`);
        console.log(`📦 Chunks recibidos: ${chunkCount}`);
        console.log(`📝 Caracteres totales: ${totalText.length}`);
        console.log(`🎯 Velocidad promedio: ${(totalText.length / (totalTime / 1000)).toFixed(0)} caracteres/segundo`);
        console.log('='.repeat(60));

        if (timeToFirstChunk < 5000) {
            console.log('✅ ¡EXCELENTE! Streaming funcionando correctamente');
        } else if (timeToFirstChunk < 10000) {
            console.log('⚠️  Aceptable, pero podría ser más rápido');
        } else {
            console.log('❌ Muy lento, revisar configuración');
        }

    } catch (error) {
        console.error('❌ Error en la prueba:', error.message);
    }
}

// Ejecutar prueba
testStreaming();
