const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
  const order = req.body;

  // Lee las propiedades del carrito
  const receiptType = order.note_attributes.find(attr => attr.name === 'Receipt Type')?.value;
  const companyName = order.note_attributes.find(attr => attr.name === 'Company Name')?.value;
  const ruc = order.note_attributes.find(attr => attr.name === 'RUC')?.value;

  // Prepara las etiquetas
  let tags = order.tags;
  if (receiptType === 'factura') {
    tags += ', Factura';
  } else if (receiptType === 'boleta') {
    tags += ', Boleta';
  }

  try {
    // Actualiza las etiquetas del pedido
    await axios.put(`https://${process.env.SHOPIFY_API_KEY}:${process.env.SHOPIFY_API_PASSWORD}@${process.env.SHOPIFY_SHOP_NAME}.myshopify.com/admin/api/2024-04/orders/${order.id}.json`, {
      order: {
        id: order.id,
        tags: tags
      }
    });

    res.status(200).send('Webhook received');
  } catch (error) {
    console.error('Error updating order tags:', error);
    res.status(500).send('Error processing webhook');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
