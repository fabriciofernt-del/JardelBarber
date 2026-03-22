import { Resend } from 'resend';

export default async function handler(req: any, res: any) {
  // Apenas aceita requisições POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return res.status(500).json({ error: 'RESEND_API_KEY não configurada' });
  }

  const resend = new Resend(resendApiKey);

  try {
    const body = req.body;
    
    // Acessando a estrutura exata que você enviou
    const appointment = body?.event?.record?.appointment;
    
    if (!appointment) {
      return res.status(400).json({ error: 'Sem agendamento no payload', received: body });
    }

    const { error } = await resend.emails.send({
      // ⚠️ IMPORTANTE: No plano gratuito do Resend, o 'from' DEVE ser onboarding@resend.dev
      // Você NÃO PODE colocar @gmail.com aqui, senão dará erro de remetente não verificado.
      from: 'Jardel Barber <onboarding@resend.dev>', 
      to: ['jardeldssbarbeiro@gmail.com'], // O e-mail de destino (precisa ser o mesmo cadastrado no Resend)
      subject: `✂️ Novo Agendamento: ${appointment.client_name}`,
      html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f59e0b;">Novo Agendamento Confirmado!</h1>
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
            <p><strong>👤 Cliente:</strong> ${appointment.client_name}</p>
            <p><strong>📱 Telefone:</strong> ${appointment.client_phone}</p>
            <p><strong>💈 Serviço:</strong> ${appointment.service}</p>
            <p><strong>👨‍🔧 Profissional:</strong> ${appointment.barber_name}</p>
            <p><strong>📅 Data:</strong> ${appointment.date} às ${appointment.time}</p>
          </div>
          <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">
            Este é um e-mail automático do seu sistema de agendamentos.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Erro no Resend:', error);
      return res.status(400).json({ error });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro interno:', error);
    return res.status(500).json({ error: 'Falha no servidor' });
  }
}
