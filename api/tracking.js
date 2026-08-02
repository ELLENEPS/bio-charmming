export default async function handler(req, res) {
  const { code, service } = req.query;

  if (!code) {
    return res.status(400).json({ error: "Código de rastreio não fornecido." });
  }

  const FRENET_TOKEN = process.env.FRENET_TOKEN || "6EE2BA6BR8962R407CR8373R6D240F50509C";
  const cleanCode = code.trim().toUpperCase();

  try {
    // Tentativa 1: Endpoint de Tracking Info da Frenet
    let frenetUrl = `https://api.frenet.com.br/tracking/trackinginfo?trackingNumber=${encodeURIComponent(cleanCode)}`;
    if (service) {
      frenetUrl += `&shippingServiceCode=${encodeURIComponent(service)}`;
    }

    const response = await fetch(frenetUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "token": FRENET_TOKEN
      }
    });

    if (response.ok) {
      const data = await response.json();
      
      // Tratamento para variações de estrutura da API Frenet
      const events = data.TrackingEvents || data.trackingEvents || data.Events || data.events;
      if (events && events.length > 0) {
        return res.status(200).json({ TrackingEvents: events });
      }
    }

    // Se for Correios (código terminando em BR), gera suporte para rastreio oficial
    if (/^[A-Z]{2}[0-9]{9}[A-Z]{2}$/.test(cleanCode)) {
      return res.status(200).json({
        directUrl: `https://rastreamento.correios.com.br/app/index.php?codigo=${cleanCode}`,
        message: "Clique abaixo para visualizar o rastreio diretamente no sistema dos Correios."
      });
    }

    return res.status(404).json({ error: "Nenhuma movimentação localizada para este código." });

  } catch (error) {
    return res.status(500).json({ error: "Erro interno ao processar rastreio." });
  }
}