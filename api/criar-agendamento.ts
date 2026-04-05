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
    const nomeCliente = dados.user_name || dados.nome || dados.client_name || 'Cliente';
    const servico = dados.service_id || 'Serviço não especificado';
    const dataAgendamento = dados.start_time ? dados.start_time.split('T')[0] : '';
    const horario = dados.start_time ? dados.start_time.split('T')[1].substring(0, 5) : '';

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Barbearia do Jardel <notificacoes@barbeariadojardel.com.br>',
      to: ['jardeldssbarbeiro@gmail.com'],
      subject: `Novo agendamento - ${nomeCliente}`,
      html: `
        <h2>Novo agendamento</h2>
        <p><strong>Cliente:</strong> ${nomeCliente}</p>
        <p><strong>Serviço:</strong> ${servico}</p>
        <p><strong>Data:</strong> ${dataAgendamento}</p>
        <p><strong>Horário:</strong> ${horario}</p>
      `
    });

    if (emailError) {
      console.error('Erro ao enviar email com Resend:', emailError);
      throw emailError;
    }

    console.log('Email enviado com sucesso:', emailData);

    return res.status(200).json({ success: true, data });

  } catch (err: any) {
    console.error('Erro interno:', err);
    return res.status(500).json({ error: 'Erro interno no servidor.', details: err.message });
  }
}
