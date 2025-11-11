#!/usr/bin/env python3
"""
Script para criar produtos Stripe em LIVE MODE
Executa usando a live API key diretamente
"""

import os
import json
import subprocess

# Ler a live key do .env.local
with open('.env.local', 'r') as f:
    for line in f:
        if line.startswith('STRIPE_API_KEY='):
            live_key = line.split('=')[1].strip()
            break

print("🚀 CRIANDO PRODUTOS STRIPE EM LIVE MODE")
print(f"   Usando: {live_key[:20]}...")
print("")

packages = [
    {"name": "Starter", "price_eur": 5, "credits": 170},
    {"name": "Basic", "price_eur": 15, "credits": 570},
    {"name": "Standard", "price_eur": 30, "credits": 1250},
    {"name": "Plus", "price_eur": 60, "credits": 2650},
    {"name": "Pro", "price_eur": 100, "credits": 4700},
    {"name": "Premium", "price_eur": 150, "credits": 6250},
]

env_vars = []
product_ids = []

for i, pkg in enumerate(packages, 1):
    print(f"{i}/6 Criando {pkg['name']} (€{pkg['price_eur']} / {pkg['credits']} créditos)...")
    
    # Criar produto
    product_cmd = [
        'curl', '-X', 'POST', 'https://api.stripe.com/v1/products',
        '-u', f"{live_key}:",
        '-d', f"name={pkg['name']}",
        '-d', f"description={pkg['credits']} créditos DUA"
    ]
    
    result = subprocess.run(product_cmd, capture_output=True, text=True)
    product = json.loads(result.stdout)
    product_id = product['id']
    livemode = product.get('livemode', False)
    
    print(f"   Product: {product_id} (livemode: {livemode})")
    product_ids.append(product_id)
    
    # Criar price
    price_cents = pkg['price_eur'] * 100
    price_cmd = [
        'curl', '-X', 'POST', 'https://api.stripe.com/v1/prices',
        '-u', f"{live_key}:",
        '-d', f"product={product_id}",
        '-d', f"unit_amount={price_cents}",
        '-d', 'currency=eur'
    ]
    
    result = subprocess.run(price_cmd, capture_output=True, text=True)
    price = json.loads(result.stdout)
    price_id = price['id']
    
    print(f"   Price: {price_id}")
    
    # Guardar para env
    var_name = f"NEXT_PUBLIC_STRIPE_PRICE_{pkg['name'].upper()}"
    env_vars.append(f"{var_name}={price_id}")
    print("")

# Salvar em arquivo
print("💾 Salvando Price IDs...")
with open('stripe-live-products.env', 'w') as f:
    f.write("# Stripe Live Mode Price IDs\n")
    f.write(f"# Gerado em: {subprocess.run(['date'], capture_output=True, text=True).stdout.strip()}\n\n")
    for var in env_vars:
        f.write(var + '\n')

print("")
print("✅ PRODUTOS CRIADOS EM LIVE MODE!")
print("")
print("📋 Price IDs salvos em: stripe-live-products.env")
print("")
print("🔄 PRÓXIMO PASSO:")
print("   source stripe-live-products.env")
print("   ./update-vercel-live-prices.sh")
print("")
