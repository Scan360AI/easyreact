import dotenv from 'dotenv';

dotenv.config();

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n.example.com/webhook/create-report';

/**
 * Call n8n webhook to create a new report
 */
export const triggerReportGeneration = async (reportData) => {
  try {
    console.log('🔄 Calling n8n webhook:', { reportId: reportData.reportId });

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reportId: reportData.reportId,
        piva: reportData.piva,
        companyName: reportData.companyName,
        email: reportData.email,
        phone: reportData.phone,
        callbackUrl: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/reports/${reportData.reportId}/complete`
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`n8n webhook failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ n8n webhook successful:', result);

    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('❌ n8n webhook error:', error.message);

    // Don't fail the report creation if n8n is down
    // The report will remain in "processing" state
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Verify n8n callback secret
 */
export const verifyCallbackSecret = (providedSecret) => {
  const expectedSecret = process.env.N8N_CALLBACK_SECRET;

  if (!expectedSecret) {
    console.warn('⚠️ N8N_CALLBACK_SECRET not set in environment');
    return true; // Allow for development
  }

  return providedSecret === expectedSecret;
};
