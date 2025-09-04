/**
 * Health check endpoint para verificar estado de la API
 * GET /api/income/health
 */

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        service: 'Income Matrix API',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Service unavailable',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
