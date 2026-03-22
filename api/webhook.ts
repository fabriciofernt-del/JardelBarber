import { Resend } from 'resend';

export default async function handler(req: any, res: any) {
  // Apenas aceita requisições POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return res.status(500).json({ error: 'RESEND_API_KEY não configurada no Vercel' });
  }

  const resend = new Resend(resendApiKey);

  try {
    const body = req.body;
    
    // DEBUG: Log completo do body para ver o formato que o Supabase está enviando
    console.log('Webhook body recebido:', JSON.stringify(body, null, 2));

    // Tenta extrair os dados da estrutura personalizada que você informou
    let appointment = body?.event?.record?.appointment;

    // FALLBACK: Se o Supabase enviar o formato padrão (INSERT direto na tabela appointments)
    if (!appointment && body?.record && body?.type === 'INSERT') {
      const r = body.record;
      
      // Formata a data e hora do formato ISO do banco
      let dateStr = 'Data não informada';
      let timeStr = 'Hora não informada';
      if (r.start_time) {
        const d = new Date(r.start_time);
        dateStr = d.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        timeStr = d.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' });
      }

      appointment = {
        client_name: r.user_name,
        client_phone: r.user_phone,
        service: `Serviço ID: ${r.service_id}`, // Como é o payload padrão, vem o ID
        barber_name: `Profissional ID: ${r.professional_id}`,
        date: dateStr,
        time: timeStr
      };
    }

    // Validação dos campos principais
    if (!appointment || !appointment.client_name) {
      return res.status(400).json({ 
        error: 'Dados de agendamento ausentes ou inválidos',
        received: body 
      });
    }

    const { data, error } = await resend.emails.send({
      // ATENÇÃO: Substitua "agendamentos@seudominio.com.br" pelo e-mail do seu domínio verificado no Resend!
      // Se você ainda não verificou um domínio, o Resend vai bloquear o envio.
      from: 'Jardel Barber <agendamentos@seudominio.com.br>', 
      to: ['jardeldssbarbeiro@gmail.com'],
      subject: `✂️ Novo Agendamento: ${appointment.client_name}`,
      html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f59e0b;">Novo Agendamento Confirmado!</h1>
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
            <p><strong>👤 Cliente:</strong> ${appointment.client_name}</p>
            <p><strong>📱 Telefone:</strong> ${appointment.client_phone || 'Não informado'}</p>
            <p><strong>💈 Serviço:</strong> ${appointment.service}</p>
            <p><strong>👨‍🔧 Profissional:</strong> ${appointment.barber_name}</p>
            <p><strong>📅 Data:</strong> ${appointment.date} às ${appointment.time}</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Erro Resend:', error);
      return res.status(400).json({ error });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Erro Servidor:', error);
    return res.status(500).json({ error: 'Falha interna no servidor' });
  }
}
