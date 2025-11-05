"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

interface LoginFormProps {
  leftVideo?: string;
}

export default function LoginForm({ leftVideo = "https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/Torna_esta_imagem_202510272224_t0fv2.mp4" }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a]">
      {/* Left Side - Video */}
      <div className="w-full hidden md:flex relative overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 30%' }}
        >
          <source src={leftVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0a0a]/30" />
      </div>

      {/* Right Side - Form */}
      <div className="w-full flex flex-col items-center justify-center px-8 lg:px-16">
        <form className="md:w-96 w-80 flex flex-col items-center justify-center space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <h2 className="text-4xl text-white font-light tracking-tight">Entrar</h2>
            <p className="text-sm text-white/60 font-light">
              Bem-vindo de volta! Entre para continuar
            </p>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            className="w-full mt-2 bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center gap-3 h-12 rounded-full hover:bg-white/10 transition-all duration-300 group"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.8055 10.0415C19.8055 9.29855 19.7453 8.78452 19.6147 8.25049H10.2002V11.5109H15.6109C15.5105 12.327 14.9665 13.5784 13.7602 14.4341L13.7444 14.5434L16.6225 16.7783L16.8236 16.7983C18.7176 15.0664 19.8055 12.7578 19.8055 10.0415Z" fill="#4285F4"/>
              <path d="M10.2002 19.1306C12.7063 19.1306 14.8158 18.3145 16.3236 16.7983L13.7602 14.4341C13.0755 14.9178 12.1484 15.2505 10.2002 15.2505C7.74462 15.2505 5.65527 13.5186 4.99091 11.1544L4.88551 11.1629L1.90388 13.4823L1.86719 13.5822C3.36487 16.5368 6.54863 18.6305 10.2002 18.6305V19.1306Z" fill="#34A853"/>
              <path d="M4.99091 11.1544C4.80023 10.6404 4.68954 10.0862 4.68954 9.51189C4.68954 8.93762 4.80023 8.38339 4.98087 7.86936L4.97585 7.75332L1.95509 5.39429L1.86719 5.44159C1.29284 6.58996 0.960938 7.87634 0.960938 9.21189C0.960938 10.5474 1.29284 11.8338 1.86719 12.9822L4.99091 11.1544Z" fill="#FBBC05"/>
              <path d="M10.2002 3.77329C12.5656 3.77329 14.1838 4.73999 15.0908 5.5861L17.353 3.38247C15.8058 1.99692 13.7063 0.960938 10.2002 0.960938C6.54863 0.960938 3.36487 3.05463 1.86719 6.00923L4.98087 7.8669C5.65527 5.50272 7.74462 3.77329 10.2002 3.77329Z" fill="#EB4335"/>
            </svg>
            <span className="text-sm text-white/80 font-light">Continuar com Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 w-full my-2">
            <div className="w-full h-px bg-white/10"></div>
            <p className="text-nowrap text-sm text-white/40 font-light">ou entre com email</p>
            <div className="w-full h-px bg-white/10"></div>
          </div>

          {/* Email Input */}
          <div className="flex items-center w-full bg-white/5 backdrop-blur-sm border border-white/10 h-12 rounded-full overflow-hidden px-6 gap-3 focus-within:border-white/20 focus-within:bg-white/10 transition-all duration-300">
            <Mail className="w-4 h-4 text-white/40" />
            <input
              type="email"
              placeholder="Email"
              className="bg-transparent text-white placeholder-white/40 outline-none text-sm w-full h-full font-light"
              required
            />
          </div>

          {/* Password Input */}
          <div className="flex items-center w-full bg-white/5 backdrop-blur-sm border border-white/10 h-12 rounded-full overflow-hidden px-6 gap-3 focus-within:border-white/20 focus-within:bg-white/10 transition-all duration-300">
            <Lock className="w-4 h-4 text-white/40" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="bg-transparent text-white placeholder-white/40 outline-none text-sm w-full h-full font-light"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-white/40 hover:text-white/60 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Remember & Forgot */}
          <div className="w-full flex items-center justify-between text-white/60">
            <div className="flex items-center gap-2">
              <input
                className="w-4 h-4 rounded border-white/20 bg-white/5 checked:bg-white checked:border-white"
                type="checkbox"
                id="checkbox"
              />
              <label className="text-sm font-light cursor-pointer" htmlFor="checkbox">
                Lembrar-me
              </label>
            </div>
            <a className="text-sm font-light hover:text-white transition-colors" href="#">
              Esqueceu a senha?
            </a>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full h-12 rounded-full text-black bg-white hover:bg-white/90 transition-all duration-300 font-medium hover:scale-[1.02]"
          >
            Entrar
          </button>

          {/* Sign Up Link */}
          <p className="text-white/60 text-sm font-light">
            Não tem uma conta?{" "}
            <a className="text-white hover:underline transition-all" href="/registo">
              Criar conta
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
