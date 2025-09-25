-- Create settings table for admin configurations
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value JSONB,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create policies for settings
CREATE POLICY "Admins can manage settings" 
ON public.settings 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.settings (key, value, description) VALUES
('platform_welcome_title', '"Bem-vindo à ABNP"', 'Título de boas-vindas da plataforma'),
('platform_welcome_message', '"Sua jornada de aprendizado em neuropsicopedagogia começa aqui."', 'Mensagem de boas-vindas da plataforma'),
('youtube_playlist_url', '""', 'URL da playlist do YouTube'),
('blog_rss_url', '""', 'URL do feed RSS do blog'),
('hotmart_course_url', '""', 'URL do curso no Hotmart'),
('hotmart_coupon_code', '""', 'Código do cupom Hotmart'),
('whatsapp_notifications', 'true', 'Ativar notificações por WhatsApp'),
('email_notifications', 'true', 'Ativar notificações por email')
ON CONFLICT (key) DO NOTHING;