import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

// Initialize Firebase App for the server environment (using the same config)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "E-mail não fornecido" });
    }

    // Fetch the single data document
    const docRef = doc(db, 'system', 'data');
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return res.status(404).json({ error: "Banco de dados não encontrado" });
    }

    const data = docSnap.data();
    const users = data.users || [];
    const userIndex = users.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());

    if (userIndex === -1) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // Generate a temporary 6-character password
    const tempPassword = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Update the user
    users[userIndex].password = tempPassword;
    users[userIndex].requiresPasswordChange = true;

    // Save it back to Firestore
    await updateDoc(docRef, { users });

    let emailSent = false;
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
        await transporter.sendMail({
          from: `"Sky Light PRO" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: "Sua Senha Provisória - Sky Light PRO",
          text: `Olá,\n\nUma solicitação de redefinição de senha foi feita para o seu usuário.\n\nSua senha provisória é: ${tempPassword}\n\nAo fazer login, você será obrigado a alterar esta senha.\n\nSe você não solicitou isso, por favor entre em contato com o administrador.\n\nEquipe Sky Light PRO.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #2563eb; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Sky Light PRO</h1>
              </div>
              <div style="padding: 30px;">
                <h2 style="color: #1e293b; margin-top: 0;">Recuperação de Acesso</h2>
                <p style="color: #475569; line-height: 1.6;">Olá,</p>
                <p style="color: #475569; line-height: 1.6;">Recebemos uma solicitação de redefinição de senha para sua conta.</p>
                <div style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; text-align: center; margin: 25px 0;">
                  <p style="color: #64748b; font-size: 14px; margin: 0 0 5px 0;">Sua senha provisória é:</p>
                  <p style="color: #0f172a; font-size: 28px; font-weight: bold; margin: 0; letter-spacing: 2px;">${tempPassword}</p>
                </div>
                <p style="color: #475569; line-height: 1.6; font-size: 14px;"><strong>Importante:</strong> Ao fazer o login com essa senha, o sistema exigirá que você cadastre uma nova senha imediatamente por motivos de segurança.</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">Se você não solicitou a redefinição, por favor desconsidere este e-mail ou entre em contato com o suporte técnico.</p>
              </div>
            </div>
          `,
        });
        emailSent = true;
      } catch (mailError) {
        console.error("Erro ao enviar e-mail:", mailError);
      }
    }

    res.status(200).json({ 
      success: true, 
      message: emailSent 
        ? "Senha provisória gerada e enviada para o seu e-mail!" 
        : "Senha provisória gerada com sucesso! (Configure as credenciais SMTP no .env para receber por e-mail real).",
      tempPassword
    });
  } catch (error) {
    console.error("Erro no Vercel Function:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
