import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // DEBUG: Log completo do body pra ver formato do Supabase
  console.log('Webhook body:', JSON.stringify(req.body, null, 2));

  // Supabase pode mandar em estruturas diferentes, testa as mais comuns
  let type, table, record;
  
  // Formato 1: direto no root
  if (req.body.type && req.body.table && req.body.record) {
    ({ type, table, record } = req.body);
  }
  // Formato 2: dentro de "payload" ou "event"
  else if (req.body.payload && req.body.payload.type) {
    ({ type, table, record } = req.body.payload);
  }
  else if (req.body.event && req.body.event.type) {
    ({ type, table, record } = req.body.event);
  }
  // Formato 3: só record (alguns setups antigos)
  else if (req.body.record) {
    type = 'INSERT';
    table = 'appointments';
    record = req.body.record;
  }
  else {
    return res.status(400).json({ 
      error: 'Invalid webhook payload', 
      received: req.body 
    });
  }

  // Verificação básica
  if (type !== 'INSERT' || table !== 'appointments' || !record) {
    return res.status(400).json({ 
      error: 'Invalid webhook payload', 
      type, table, record 
    });
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

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const resend = new Resend(resendApiKey);

  try {
    const { data: serviceData } = await supabase
      .from('services')
      .select('name')
      .eq('id', service_id)
      .single();

    const { data: professionalData } = await supabase
      .from('professionals')
      .select('name')
      .eq('id', professional_id)
      .single();

    const serviceName = serviceData?.name || 'Serviço não encontrado';
    const professionalName = professionalData?.name || 'Profissional não encontrado';

    const date = new Date(start_time);
    const formattedDate = date.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const emailText = `
Novo agendamento recebido:

Cliente: ${user_name}
Telefone: ${user_phone}
Serviço: ${serviceName}
Profissional: ${professionalName}
Data/Hora: ${formattedDate}
    `.trim();

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