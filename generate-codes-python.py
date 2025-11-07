#!/usr/bin/env python3
"""
🎫 GERADOR DE 170 CÓDIGOS DE ACESSO EXCLUSIVOS - DUA IA
Gera códigos únicos formato DUA-XXXX-XXX
"""

import random
import string
from datetime import datetime

def generate_code():
    """Gera código formato DUA-XXXX-XXX"""
    chars = string.ascii_uppercase + string.digits
    part2 = ''.join(random.choices(chars, k=4))
    part3 = ''.join(random.choices(chars, k=3))
    return f"DUA-{part2}-{part3}"

def generate_unique_codes(quantity=170):
    """Gera conjunto de códigos únicos"""
    codes = set()
    attempts = 0
    max_attempts = quantity * 10
    
    print(f"\n🔄 Gerando {quantity} códigos únicos...\n")
    
    while len(codes) < quantity and attempts < max_attempts:
        code = generate_code()
        if code not in codes:
            codes.add(code)
            if len(codes) % 10 == 0:
                print(f"   ✓ {len(codes)} códigos gerados...")
        attempts += 1
    
    return sorted(list(codes))

def export_codes(codes):
    """Exporta códigos para TXT e JSON"""
    timestamp = datetime.now().strftime('%Y-%m-%d')
    
    # Criar TXT
    txt_lines = [
        '═══════════════════════════════════════════════════════════',
        '   🎫 CÓDIGOS DE ACESSO EXCLUSIVOS - DUA IA',
        '═══════════════════════════════════════════════════════════',
        '',
        f'Data de Geração: {datetime.now().strftime("%d/%m/%Y %H:%M:%S")}',
        f'Total de Códigos: {len(codes)}',
        f'Validade: Uso único por código',
        '',
        '⚠️  IMPORTANTE: Apenas 170 códigos disponíveis!',
        '   Cada código dá acesso TOTAL à plataforma DUA IA',
        '',
        '───────────────────────────────────────────────────────────',
        '   CÓDIGOS DE ACESSO (170 EXCLUSIVOS)',
        '───────────────────────────────────────────────────────────',
        '',
    ]
    
    for i, code in enumerate(codes, 1):
        txt_lines.append(f'{str(i).zfill(3)}. {code}')
    
    txt_lines.extend([
        '',
        '───────────────────────────────────────────────────────────',
        '   BENEFÍCIOS POR CÓDIGO',
        '───────────────────────────────────────────────────────────',
        '',
        '✅ Acesso completo à plataforma DUA IA',
        '✅ 5.000 tokens iniciais',
        '✅ 1.000 DUA Coins',
        '✅ Tier Premium automático',
        '✅ Acesso a todos os estúdios',
        '✅ Chat AI ilimitado',
        '✅ Design Studio completo',
        '✅ Voice AI premium',
        '',
        '───────────────────────────────────────────────────────────',
        '   COMO USAR',
        '───────────────────────────────────────────────────────────',
        '',
        '1. Acesse: https://dua.pt/acesso',
        '2. Insira o código de acesso',
        '3. Insira seu email',
        '4. Receba o magic link por email',
        '5. Faça login e aproveite!',
        '',
        '⚠️  ATENÇÃO:',
        '   • Cada código só pode ser usado UMA VEZ',
        '   • Após uso, o código fica inativo',
        '   • Guarde seu código em lugar seguro',
        '',
        '═══════════════════════════════════════════════════════════',
    ])
    
    txt_content = '\n'.join(txt_lines)
    txt_file = f'CODIGOS_ACESSO_DUA_{timestamp}.txt'
    
    with open(txt_file, 'w', encoding='utf-8') as f:
        f.write(txt_content)
    
    print(f"\n📄 Arquivo gerado: {txt_file}")
    print(f"   Total de códigos: {len(codes)}")
    
    return txt_file

def main():
    print('\n╔═══════════════════════════════════════════════════════════╗')
    print('║   🎫 GERADOR DE CÓDIGOS - DUA IA (170 EXCLUSIVOS)        ║')
    print('╚═══════════════════════════════════════════════════════════╝')
    
    # Gerar códigos
    codes = generate_unique_codes(170)
    
    # Exportar
    txt_file = export_codes(codes)
    
    print('\n╔═══════════════════════════════════════════════════════════╗')
    print('║   ✅ CÓDIGOS GERADOS COM SUCESSO                          ║')
    print('╚═══════════════════════════════════════════════════════════╝')
    print(f'\n📊 Resumo:')
    print(f'   • Total de códigos: {len(codes)}')
    print(f'   • Formato: DUA-XXXX-XXX')
    print(f'   • Arquivo: {txt_file}')
    print(f'   • Status: ✅ PRONTO PARA USO\n')

if __name__ == '__main__':
    main()
