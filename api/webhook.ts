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

    const { 
      client_name, 
      client_phone, 
      service, 
      date, 
      time, 
      barber_name 
    } = data;

    if (!client_name || !service || !date || !time) {
      console.log('Dados recebidos incompletos:', req.body);
      return res.status(400).json({ 
        error: 'Dados incompletos. Certifique-se de enviar nome, serviço, data e hora.' 
      });
    }

    // --- 1. ENVIO DE E-MAIL (RESEND) ---
    let emailStatus = 'Erro';
    let emailId = null;

    try {
      const emailResponse = await resend.emails.send({
        from: 'Agendamentos <no-reply@barbeariadojardel.com>', // precisa ser domínio verificado
        to: ['jardeldssbarbeiro@gmail.com'], // e-mail real do Jardel
        subject: `🎫 Novo Agendamento: ${client_name}`,
        html: `
          <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #d97706;">✂️ Novo Agendamento Recebido!</h2>
            <p>Olá Jardel, você tem um novo cliente agendado:</p>
            <hr />
            <p><strong>👤 Cliente:</strong> ${client_name}</p>
            <p><strong>📱 Telefone:</strong> ${client_phone || 'Não informado'}</p>
            <p><strong>💈 Serviço:</strong> ${service}</p>
            <p><strong>📅 Data:</strong> ${date}</p>
            <p><strong>⏰ Horário:</strong> ${time}</p>
            <p><strong>🧔 Barbeiro:</strong> ${barber_name || 'Jardel'}</p>
            <hr />
            <p style="font-size: 12px; color: #666;">Mensagem automática do sistema de agendamentos.</p>
          </div>
        `,
      });

      console.log('Resultado E-mail:', emailResponse);
      if (emailResponse?.data?.id) {
        emailStatus = 'Enviado';
        emailId = emailResponse.data.id;
      }
    } catch (emailError) {
      console.error('Erro no envio de e-mail:', emailError);
    }

    // --- 2. ENVIO DE WHATSAPP (META CLOUD API) ---
    const whatsappMessage = `✂️ *NOVO AGENDAMENTO*

👤 Cliente: ${client_name}
📱 Telefone: ${client_phone || 'Não informado'}
💈 Serviço: ${service}
📅 Data: ${date}
⏰ Horário: ${time}
🧔 Barbeiro: ${barber_name || 'Jardel'}`;

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

    return res.status(200).json({ 
      success: true, 
      email: emailStatus,
      whatsapp: whatsappResult.messages ? 'Enviado' : 'Erro',
      details: {
        emailId,
        whatsappId: whatsappResult.messages?.[0]?.id
      }
    });

  } catch (err: any) {
    console.error('Erro no Webhook:', err);
    return res.status(500).json({ error: 'Erro interno no servidor.', details: err.message });
  }
}
