import { Resend } from 'resend';

// Inicializa o Resend com a chave de API das variáveis de ambiente
const resend = new Resend(process.env.RESEND_API_KEY!);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  try {
    // Suporta payload direto ou record do Supabase
    const data = req.body.record || req.body;

    // O payload pode vir com 'nome' ou 'client_name', 'servico' ou 'service', etc.
    const nome = data.nome || data.client_name;
    const telefone = data.telefone || data.client_phone;
    const servico = data.servico || data.service;
    const dataAgendamento = data.data || data.date;
    const hora = data.hora || data.time;
    const barbeiro = data.barbeiro || data.barber_name;

    if (!nome || !servico || !dataAgendamento || !hora) {
      console.log('Dados recebidos incompletos:', req.body);
      return res.status(400).json({ 
        error: 'Dados incompletos. Certifique-se de enviar nome, serviço, data e hora.' 
      });
    }

    // --- 1. ENVIO DE WHATSAPP (META CLOUD API) ---
    let whatsappId = null;
    try {
      const whatsappMessage = `✂️ *NOVO AGENDAMENTO*

👤 Cliente: ${nome}
📱 Telefone: ${telefone || 'Não informado'}
💈 Serviço: ${servico}
📅 Data: ${dataAgendamento}
⏰ Horário: ${hora}
🧔 Barbeiro: ${barbeiro || 'Jardel'}`;

      const whatsappResponse = await fetch(
        `https://graph.facebook.com/v20.0/1120552827797911/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`, // token seguro via env
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: "5585999451711", // número real do Jardel
            type: "text",
            text: { body: whatsappMessage },
          }),
        }
      );

      const whatsappResult = await whatsappResponse.json();
      console.log('Resultado WhatsApp:', whatsappResult);
      if (whatsappResult.messages && whatsappResult.messages.length > 0) {
        whatsappId = whatsappResult.messages[0].id;
      }
    } catch (whatsappError) {
      console.error('Erro no envio de WhatsApp:', whatsappError);
    }

    // --- 2. ENVIO DE E-MAIL (RESEND) ---
    let emailId = null;
    try {
      const dataEmail = await resend.emails.send({
        from: 'Barbearia Jardel <onboarding@resend.dev>',
        to: [
          'jardeldssbarbeiro@gmail.com',
          'fabriciofer@gmail.com'
        ],
        subject: `🗓️ Novo agendamento: ${nome}`,
        html: `
          <h2>Novo agendamento!</h2>
          <p>Cliente: ${nome}</p>
          <p>Serviço: ${servico}</p>
          <p>Data: ${dataAgendamento} ${hora}</p>
          <hr><small>App Jardel</small>
        `,
      });

      console.log('Email ID:', dataEmail.data);
      if (dataEmail.data?.id) {
        emailId = dataEmail.data.id;
      }
    } catch (emailError) {
      console.error('Erro no envio de e-mail:', emailError);
    }

    return res.status(200).json({ 
      success: true, 
      whatsappId,
      emailId
    });

  } catch (err: any) {
    console.error('Erro no Webhook:', err);
    return res.status(500).json({ error: 'Erro interno no servidor.', details: err.message });
  }
}
