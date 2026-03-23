import { Resend } from 'resend';

// Inicializa o Resend com a chave de API das variáveis de ambiente
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: any, res: any) {
  // Garantir que apenas requisições POST sejam aceitas
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  try {
    // 1. Ler o JSON do body
    const { 
      client_name, 
      client_phone, 
      service, 
      date, 
      time, 
      barber_name 
    } = req.body;

    // 2. Validar se os campos obrigatórios existem
    if (!client_name || !service || !date || !time) {
      return res.status(400).json({ 
        error: 'Dados incompletos. Certifique-se de enviar nome, serviço, data e hora.' 
      });
    }

    // 3. Chamar o Resend para disparar o e-mail
    const { data, error } = await resend.emails.send({
      from: 'Jardel Barber <onboarding@resend.dev>',
      to: ['jardeldssbarbeiro@gmail.com'],
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
          <p style="font-size: 12px; color: #666;">Esta é uma mensagem automática do seu sistema de agendamentos.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Erro no Resend:', error);
      return res.status(500).json({ error: 'Falha ao enviar e-mail.' });
    }

    // 4. Retornar sucesso
    return res.status(200).json({ success: true, message: 'Notificação enviada!', id: data?.id });

  } catch (err) {
    console.error('Erro interno:', err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}
