export default async function handler(req, res) {
  const { code, service } = req.query;

  if (!code) {
    return res.status(400).json({ error: "Código de rastreio não fornecido." });
  }

  // Token oficial da Frenet
  const FRENET_TOKEN = process.env.FRENET_TOKEN || "6EE2BA6BR8962R407CR8373R6D240F50509C";

  // Monta a URL de consulta na API da Frenet
  let url = `https://api.frenet.com.br/tracking/trackinginfo?trackingNumber=${encodeURIComponent(code)}`;
  if (service) {
    url += `&shippingServiceCode=${encodeURIComponent(service)}`;
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "token": FRENET_TOKEN
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: "Erro ao consultar rastreio na Frenet." });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Erro interno no servidor de rastreio." });
  }
}