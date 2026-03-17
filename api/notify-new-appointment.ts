import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export default async function handler(req: any, res: any) {
  // Vercel API routes use this signature for standard serverless functions
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // O Supabase envia o payload no corpo da requisição
  const { record, type, table } = req.body;

  // Verificação básica de segurança/integridade
  if (type !== 'INSERT' || table !== 'appointments' || !record) {
    return res.status(400).json({ error: 'Invalid webhook payload' });
  }

  const {
    user_name,
    user_phone,
    service_id,
    professional_id,
    start_time
  } = record;

  // Variáveis de ambiente
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;
  const emailDestino = process.env.EMAIL_DESTINO || 'jardeldssbarbeiro@gmail.com';

  if (!supabaseUrl || !supabaseServiceKey || !resendApiKey) {
    console.error('Missing environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // Inicializa clientes
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const resend = new Resend(resendApiKey);

  try {
    // Busca nome do serviço
    const { data: serviceData } = await supabase
      .from('services')
      .select('name')
      .eq('id', service_id)
      .single();

    // Busca nome do profissional
    const { data: professionalData } = await supabase
      .from('professionals')
      .select('name')
      .eq('id', professional_id)
      .single();

    const serviceName = serviceData?.name || 'Serviço não encontrado';
    const professionalName = professionalData?.name || 'Profissional não encontrado';

    // Formata a data (YYYY-MM-DDTHH:MM:SS -> DD/MM/YYYY HH:MM)
    const date = new Date(start_time);
    const formattedDate = date.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Monta o corpo do e-mail
    const emailText = `
Novo agendamento recebido:

Cliente: ${user_name}
Telefone: ${user_phone}
Serviço: ${serviceName}
Profissional: ${professionalName}
Data/Hora: ${formattedDate}
    `.trim();

    // Envia o e-mail via Resend
    // Nota: Se você não tiver um domínio verificado no Resend, use 'onboarding@resend.dev' como remetente
    const { error: resendError } = await resend.emails.send({
      from: 'Jardel Barber <onboarding@resend.dev>',
      to: emailDestino,
      subject: 'Novo agendamento - Jardel Barber',
      text: emailText,
    });

    if (resendError) {
      throw resendError;
    }

    return res.status(200).json({ message: 'Notification sent successfully' });
  } catch (error: any) {
    console.error('Error processing notification:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
