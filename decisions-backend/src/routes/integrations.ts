import express, { Request, Response } from 'express';
import { pool } from '../db/init';
import { verifyToken } from '../middleware/auth';
import axios from 'axios';

const router = express.Router();

const isValidUrl = (urlString: string): boolean => {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

// Connect to n8n webhook
router.post('/n8n/connect', verifyToken, async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { webhookUrl } = req.body;

  try {
    if (!isValidUrl(webhookUrl)) {
      return res.status(400).json({ error: 'Invalid webhook URL' });
    }

    // Test webhook connection
    await axios.post(webhookUrl, {
      test: true,
      timestamp: new Date().toISOString(),
    });

    // Store integration
    await pool.query(
      `INSERT INTO integrations (user_id, integration_type, status, access_token)
       VALUES ($1, $2, $3, $4)`,
      [userId, 'n8n', 'connected', webhookUrl]
    );

    res.json({ status: 'connected' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to connect to n8n' });
  }
});

// Connect to Shopify
router.post('/shopify/connect', verifyToken, async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { accessToken, storeUrl } = req.body;

  try {
    // Validate storeUrl to prevent SSRF
    if (!storeUrl || typeof storeUrl !== 'string') {
      return res.status(400).json({ error: 'Invalid store URL' });
    }

    if (!storeUrl.endsWith('.myshopify.com')) {
      return res.status(400).json({ error: 'Invalid Shopify store URL' });
    }

    // Verify Shopify connection
    const response = await axios.get(`https://${storeUrl}/admin/api/2024-01/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
      },
    });

    if (response.data.shop) {
      await pool.query(
        `INSERT INTO integrations (user_id, integration_type, status, access_token, store_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, 'shopify', 'connected', accessToken, storeUrl]
      );

      res.json({ status: 'connected', shop: response.data.shop.name });
    }
  } catch (error) {
    res.status(400).json({ error: 'Failed to connect to Shopify' });
  }
});

// Connect to Plausible
router.post('/plausible/connect', verifyToken, async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { siteId, apiKey } = req.body;

  try {
    if (!siteId || typeof siteId !== 'string' || !apiKey || typeof apiKey !== 'string') {
      return res.status(400).json({ error: 'Invalid siteId or apiKey' });
    }

    // Verify Plausible connection
    const response = await axios.get(`https://plausible.io/api/v1/sites/${siteId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (response.data.domain) {
      await pool.query(
        `INSERT INTO integrations (user_id, integration_type, status, access_token, store_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, 'plausible', 'connected', apiKey, siteId]
      );

      res.json({ status: 'connected', domain: response.data.domain });
    }
  } catch (error) {
    res.status(400).json({ error: 'Failed to connect to Plausible' });
  }
});

export default router;
