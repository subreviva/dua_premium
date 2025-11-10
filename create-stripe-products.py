#!/usr/bin/env python3
"""
Script para criar produtos e preços Stripe automaticamente
"""

import subprocess
import json

# Pacotes de créditos DUA Premium
PACKS = [
    {
        "name": "DUA Premium - Pack Basic",
        "description": "350 créditos para IA",
        "credits": 350,
        "pack_id": "basic",
        "price_eur": 10.00
    },
    {
        "name": "DUA Premium - Pack Standard",
        "description": "550 créditos para IA (+10% bônus)",
        "credits": 550,
        "pack_id": "standard",
        "price_eur": 15.00
    },
    {
        "name": "DUA Premium - Pack Plus",
        "description": "1150 créditos para IA (+15% bônus)",
        "credits": 1150,
        "pack_id": "plus",
        "price_eur": 30.00
    },
    {
        "name": "DUA Premium - Pack Pro",
        "description": "2400 créditos para IA (+20% bônus)",
        "credits": 2400,
        "pack_id": "pro",
        "price_eur": 60.00
    },
    {
        "name": "DUA Premium - Pack Premium",
        "description": "6250 créditos para IA (+25% bônus)",
        "credits": 6250,
        "pack_id": "premium",
        "price_eur": 150.00
    }
]

print("💳 Criando produtos Stripe para DUA Premium...\n")

# Starter já foi criado manualmente
CREATED_PRODUCTS = {
    "starter": {
        "product_id": "prod_TOs8oftD7TGtI1",
        "price_id": "price_1SS4NxAz1k4yaMdfsYj53Kd6",
        "credits": 170,
        "price_eur": 5.00
    }
}

for i, pack in enumerate(PACKS, start=2):
    print(f"[{i}/6] Criando {pack['name']}...")
    
    # Criar produto
    product_cmd = [
        "stripe", "products", "create",
        "--name", pack["name"],
        "--description", pack["description"],
        "-d", f"metadata[credits]={pack['credits']}",
        "-d", f"metadata[pack_id]={pack['pack_id']}"
    ]
    
    try:
        result = subprocess.run(product_cmd, capture_output=True, text=True, check=True)
        product_data = json.loads(result.stdout)
        product_id = product_data["id"]
        print(f"  ✓ Produto criado: {product_id}")
        
        # Criar preço
        price_cents = int(pack["price_eur"] * 100)
        price_cmd = [
            "stripe", "prices", "create",
            "--product", product_id,
            "--unit-amount", str(price_cents),
            "--currency", "eur",
            "-d", f"metadata[credits]={pack['credits']}",
            "-d", f"metadata[pack_id]={pack['pack_id']}"
        ]
        
        result = subprocess.run(price_cmd, capture_output=True, text=True, check=True)
        price_data = json.loads(result.stdout)
        price_id = price_data["id"]
        print(f"  ✓ Preço criado: {price_id} (€{pack['price_eur']:.2f})\n")
        
        CREATED_PRODUCTS[pack["pack_id"]] = {
            "product_id": product_id,
            "price_id": price_id,
            "credits": pack["credits"],
            "price_eur": pack["price_eur"]
        }
        
    except subprocess.CalledProcessError as e:
        print(f"  ❌ Erro: {e.stderr}\n")
        continue

# Gerar arquivo .env
print("\n📝 Gerando arquivo stripe-products.env...")

with open("stripe-products.env", "w") as f:
    f.write("# ═══════════════════════════════════════════════════════════════════════════\n")
    f.write("# STRIPE PRODUCTS - DUA PREMIUM CREDIT PACKS\n")
    f.write("# ═══════════════════════════════════════════════════════════════════════════\n\n")
    
    for pack_id, data in sorted(CREATED_PRODUCTS.items()):
        f.write(f"# {pack_id.upper()} - €{data['price_eur']:.2f} / {data['credits']} créditos\n")
        f.write(f"NEXT_PUBLIC_STRIPE_PRICE_{pack_id.upper()}={data['price_id']}\n")
        f.write(f"STRIPE_PRODUCT_{pack_id.upper()}={data['product_id']}\n\n")

print("✓ Arquivo criado: stripe-products.env\n")

# Resumo
print("═" * 60)
print("✅ PRODUTOS CRIADOS COM SUCESSO!")
print("═" * 60)
print("\n📋 RESUMO:\n")

for pack_id, data in sorted(CREATED_PRODUCTS.items()):
    print(f"  {pack_id.ljust(10)} €{str(data['price_eur']).ljust(6)} → {str(data['credits']).rjust(4)} créditos")
    print(f"             Price ID: {data['price_id']}")

print("\n📝 PRÓXIMOS PASSOS:")
print("\n1. Adicionar variáveis ao .env.local:")
print("   cat stripe-products.env >> .env.local")
print("\n2. Adicionar variáveis na Vercel (production):")
print("   Copiar e colar o conteúdo de stripe-products.env nas Settings > Environment Variables")
print("\n3. Testar webhook localmente:")
print("   stripe listen --forward-to localhost:3000/api/stripe/webhook")
print("\n🎉 Setup completo!\n")
