import React, { useState } from 'react';
import { Lightbulb, Lock, Mail, Eye, EyeOff, ShieldCheck, Activity, Cpu, Radio } from 'lucide-react';
import { UserAccount } from '../types';

interface LoginScreenProps {
  onLogin: (user: UserAccount, rememberMe: boolean) => void;
  mockUsers: UserAccount[];
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, mockUsers }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const [isForgotPasswordView, setIsForgotPasswordView] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Tenta encontrar um usuário que corresponda ao e-mail ou matrícula (registrationCode)
    const foundUser = mockUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() || u.registrationCode.toLowerCase() === email.toLowerCase()
    );

    if (foundUser) {
      // Verifica a senha
      if (foundUser.password === password) {
        onLogin(foundUser, rememberMe);
      } else {
        setError('Credenciais inválidas. Senha incorreta.');
      }
    } else {
      setError('Credenciais inválidas. Verifique seu e-mail ou matrícula.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setForgotPasswordMessage('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setForgotPasswordMessage(`Senha provisória enviada! Para fins de teste (simulação de e-mail), sua senha é: ${data.tempPassword}`);
      } else {
        setError(data.error || 'Erro ao processar solicitação.');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row font-sans selection:bg-blue-500/30">
      
      {/* Lado Esquerdo - Marca e Informações (Escondido em telas muito pequenas) */}
      <div className="hidden md:flex flex-1 relative flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950/20 p-12 lg:p-16 border-r border-slate-800">
        {/* Efeitos de Luz de Fundo */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]"></div>
          <div className="absolute bottom-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[150px]"></div>
        </div>

        {/* Header Esquerdo */}
        <div className="relative z-10 flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Sky Light <span className="text-blue-400">PRO</span></h1>
            <p className="text-slate-400 text-sm font-medium tracking-wide">Ecossistema de Cidades Inteligentes</p>
          </div>
        </div>

        {/* Centro Esquerdo - Features */}
        <div className="relative z-10 max-w-lg mt-12 mb-auto">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
            Telegestão e <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Automação Inteligente</span>
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed mb-8">
            Controle centralizado, monitoramento preditivo e automação em tempo real para a rede de iluminação pública. Maximizando eficiência energética e segurança urbana.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-slate-300">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm">
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="font-medium">Redução de até 60% no consumo de energia</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-300">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
              </div>
              <span className="font-medium">Manutenção Preditiva e Detecção de Falhas</span>
            </div>
          </div>
        </div>

        {/* Rodapé Esquerdo - Telemetria em Tempo Real */}
        <div className="relative z-10 w-full mt-12">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status do Sistema</h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-bold text-emerald-400">ONLINE</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                <div className="flex items-center space-x-2 mb-1">
                  <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Nódulos Ativos</span>
                </div>
                <div className="text-xl font-mono font-bold text-white">4.120</div>
              </div>
              <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                <div className="flex items-center space-x-2 mb-1">
                  <Radio className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Gateways</span>
                </div>
                <div className="text-xl font-mono font-bold text-white">26 <span className="text-xs text-slate-500 font-sans font-medium">/ 26</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lado Direito - Área de Login */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-24 bg-white relative">
        
        {/* Mobile Header (Visível apenas quando a tela de marca esconde) */}
        <div className="md:hidden flex items-center space-x-3 mb-10 mt-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Sky Light</h1>
            <p className="text-slate-500 text-xs font-medium">Telegestão PRO</p>
          </div>
        </div>

        <div className="max-w-md w-full mx-auto">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
              {isForgotPasswordView ? 'Recuperar Senha' : 'Bem-vindo de volta'}
            </h2>
            <p className="text-slate-500">
              {isForgotPasswordView 
                ? 'Insira seu e-mail corporativo para receber uma senha provisória.' 
                : 'Insira suas credenciais para acessar o painel de telegestão.'}
            </p>
          </div>

          {/* Formulário de Esqueci a Senha */}
          {isForgotPasswordView ? (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
                  {error}
                </div>
              )}
              {forgotPasswordMessage && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
                  {forgotPasswordMessage}
                </div>
              )}
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">E-mail Corporativo</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-3 py-3 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                    placeholder="ex: carlos.silva@skylight.gov.br"
                    required
                  />
                </div>
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Enviar Senha Provisória
                </button>
              </div>
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPasswordView(false);
                    setError('');
                    setForgotPasswordMessage('');
                  }}
                  className="text-sm font-medium text-slate-500 hover:text-slate-700"
                >
                  Voltar para o Login
                </button>
              </div>
            </form>
          ) : (
          <form onSubmit={handleManualLogin} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
                {error}
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">E-mail Corporativo ou Matrícula</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-3 py-3 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                  placeholder="ex: carlos.silva@skylight.gov.br"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-700">Senha</label>
                <button 
                  type="button"
                  onClick={() => setIsForgotPasswordView(true)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-11 py-3 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700 cursor-pointer">
                Lembrar de mim neste dispositivo
              </label>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Entrar na Plataforma
            </button>
          </form>
          )}
          
          <div className="mt-8 text-center text-xs text-slate-500">
            <p>Uso exclusivo para colaboradores autorizados e parceiros da prefeitura.</p>
            <p className="mt-1">Ao fazer login, você concorda com a <a href="#" className="text-blue-600 hover:underline">Política de Privacidade</a>.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
