import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

// Inicializa os clientes com as chaves de ambiente
const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!, 
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY!
);
const resend = new Resend(process.env.RESEND_API_KEY!);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  try {
    const dados = req.body;

    // 1. Salvar no Supabase
    // Observação: Ajuste o nome da tabela ('agendamentos' ou 'appointments') conforme o seu banco
    const { data, error } = await supabase
      .from('appointments') 
      .insert([dados])
      .select()
      .single();

    if (error) {
      console.error('Erro Supabase:', error.message);
      return res.status(500).json({ error: 'Erro ao salvar no banco de dados', details: error.message });
    }

    // 2. Enviar e-mail pelo Resend
    // Verifica se o e-mail do cliente foi enviado no payload
    const clienteEmail = dados.email || dados.user_email || dados.client_email;
    const dataHora = dados.data_hora || dados.start_time || '';

    if (clienteEmail) {
      await resend.emails.send({
        from: 'Barbearia Jardel <no-reply@barbeariadojardel.com.br>',
        to: clienteEmail,
        subject: 'Confirmação de agendamento',
        html: `<p>Seu horário foi confirmado para ${dataHora}</p>`
      });
    }

    // (Opcional) Enviar notificação para o barbeiro também, se desejar
    await resend.emails.send({
      from: 'Barbearia Jardel <no-reply@barbeariadojardel.com.br>',
      to: ['jardeldssbarbeiro@gmail.com', 'fabriciofer@gmail.com'],
      subject: `🗓️ Novo agendamento recebido`,
      html: `<p>Novo agendamento salvo no sistema.</p>`
    });

    return res.status(200).json({ success: true, data });

  } catch (err: any) {
    console.error('Erro interno:', err);
    return res.status(500).json({ error: 'Erro interno no servidor.', details: err.message });
  }
}
