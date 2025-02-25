
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ResetPasswordRequest {
  email: string;
  resetLink: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, resetLink }: ResetPasswordRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "TimeSheet <noreply@seudominio.com.br>",
      to: [email],
      subject: "Recuperação de Senha - TimeSheet",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; text-align: center;">Recuperação de Senha</h1>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Você solicitou a recuperação de senha para sua conta no TimeSheet.
          </p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Para redefinir sua senha, clique no botão abaixo:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}"
               style="background-color: #0284c7; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              Redefinir Senha
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.5;">
            Se você não solicitou a recuperação de senha, por favor ignore este email.
          </p>
          
          <hr style="border: 1px solid #eee; margin: 30px 0;" />
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            Este é um email automático, por favor não responda.
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in reset-password function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
