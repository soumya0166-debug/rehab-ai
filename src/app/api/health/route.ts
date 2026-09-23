import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'REHAB-AI',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    boundaries: {
      isAssistiveSystem: true,
      diagnosticAuthority: 'clinician_only',
      clientSideComputerVision: true,
    },
  });
}
