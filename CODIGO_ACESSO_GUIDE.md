# 🎫 SISTEMA DE CÓDIGOS DE ACESSO DUA - GUIA COMPLETO

## ❌ PROBLEMA IDENTIFICADO

Os códigos de acesso **NÃO ESTÃO NA BASE DE DADOS**.

Quando o usuário tenta usar um código na página `/acesso`, a mensagem diz "código não existe" porque a tabela `invite_codes` está vazia.

---

## ✅ SOLUÇÃO (3 PASSOS SIMPLES)

### 📋 PASSO 1: Aceder ao Supabase Dashboard

1. Vá para: https://supabase.com/dashboard
2. Selecione o projeto **DUA**
3. Clique em **SQL Editor** (no menu lateral esquerdo)
4. Clique em **New Query**

---

### 📝 PASSO 2: Executar o Script SQL

1. Abra o arquivo: **`insert-170-codes.sql`**
2. **Copie TODO o conteúdo** do arquivo
3. **Cole** no SQL Editor do Supabase
4. Clique em **RUN** (ou pressione Ctrl+Enter)

**Aguarde a execução (pode levar 5-10 segundos)**

---

### ✅ PASSO 3: Verificar o Resultado

Após executar, você verá algo como:

```
┌──────────────┬──────────────┬────────────┐
│ total_codes  │ active_codes │ used_codes │
├──────────────┼──────────────┼────────────┤
│ 170          │ 170          │ 0          │
└──────────────┴──────────────┴────────────┘
```

**Se vir isso, SUCESSO! ✅**

---

## 🧪 TESTAR UM CÓDIGO

Após inserir os códigos, teste imediatamente:

### No Supabase SQL Editor:

```sql
SELECT code, active, used_by, created_at 
FROM invite_codes 
WHERE code = 'DUA-03BN-9QT';
```

**Deve retornar:**
- `code`: DUA-03BN-9QT
- `active`: true
- `used_by`: null
- `created_at`: (timestamp atual)

### Na Aplicação:

1. Vá para: `http://localhost:3000/acesso` (ou URL de produção)
2. Digite o código: **DUA-03BN-9QT**
3. Clique em **Validar Código**
4. **Deve aparecer:** "Código válido ✅"

---

## 📊 LISTA COMPLETA DOS 170 CÓDIGOS

<details>
<summary>Clique para expandir todos os códigos</summary>

```
001. DUA-03BN-9QT    036. DUA-6XTN-9NK    071. DUA-GHVM-R78    106. DUA-MUTS-JSV    141. DUA-TH5G-4OB
002. DUA-044P-OYM    037. DUA-6Z1U-9PT    072. DUA-GKD7-2BR    107. DUA-N0AP-HWB    142. DUA-TMGC-L07
003. DUA-09P2-GDD    038. DUA-7EUY-DZR    073. DUA-GUFZ-0TT    108. DUA-N0WJ-XLG    143. DUA-TQY2-L5H
004. DUA-11SF-3GX    039. DUA-7F5Q-H6A    074. DUA-I3BP-FJC    109. DUA-N9SE-4C1    144. DUA-TWT8-4U1
005. DUA-11UF-1ZR    040. DUA-7FSW-HQH    075. DUA-ICJH-5CO    110. DUA-NJFT-HH8    145. DUA-TXPY-5KF
006. DUA-17OL-JNL    041. DUA-7N7T-LD7    076. DUA-IFAL-T5L    111. DUA-NL2B-7NK    146. DUA-TZ3L-03T
007. DUA-17Q2-DCZ    042. DUA-8HC5-7SM    077. DUA-IVZX-8A8    112. DUA-NL8B-MJS    147. DUA-U450-QT6
008. DUA-1AG9-T4T    043. DUA-8NET-YUG    078. DUA-J4G2-VLJ    113. DUA-NORV-63I    148. DUA-U5YA-J46
009. DUA-1F71-A68    044. DUA-8O80-GKM    079. DUA-JCZK-A5A    114. DUA-NVM9-ESS    149. DUA-UI2I-83Y
010. DUA-1KVM-WND    045. DUA-8T1M-4J5    080. DUA-JDVL-FTY    115. DUA-NVYT-G77    150. DUA-UNSP-K53
011. DUA-1WG9-7U7    046. DUA-9P5N-QG0    081. DUA-JL3M-FY3    116. DUA-NWUS-5SG    151. DUA-US35-PBZ
012. DUA-2OZG-PSG    047. DUA-9S9L-D3W    082. DUA-JNK9-22G    117. DUA-NYB3-4PF    152. DUA-UWTP-HHP
013. DUA-2PH0-G3I    048. DUA-A77V-408    083. DUA-JXC1-Z12    118. DUA-O8T0-M9P    153. DUA-V3I6-RPH
014. DUA-2TEJ-SK9    049. DUA-A7IE-4G4    084. DUA-JY3R-IOE    119. DUA-OLGI-Q24    154. DUA-V58K-LF0
015. DUA-352J-L4R    050. DUA-B5KG-MDT    085. DUA-K5JE-H8K    120. DUA-OO81-UP4    155. DUA-VB8L-2RB
016. DUA-3CTK-MVZ    051. DUA-B6OT-18R    086. DUA-K89W-NE7    121. DUA-PC2X-2NY    156. DUA-VCJQ-N9F
017. DUA-3E3Z-CR1    052. DUA-B7TZ-SRS    087. DUA-KAWU-ZWV    122. DUA-PJ8I-9BN    157. DUA-VDY7-A55
018. DUA-3FUG-4QE    053. DUA-BISN-J7T    088. DUA-KJ6G-UCM    123. DUA-PKQU-6XP    158. DUA-VI43-SGG
019. DUA-3UKV-FA8    054. DUA-CJBX-MVP    089. DUA-KON4-TGW    124. DUA-Q32A-SW3    159. DUA-VV41-4D5
020. DUA-44MD-4VD    055. DUA-COPC-B57    090. DUA-KRTT-BMU    125. DUA-Q4Q8-18T    160. DUA-W0E2-3II
021. DUA-4ASV-JAN    056. DUA-D164-YBU    091. DUA-L8JQ-UX5    126. DUA-QF11-UWY    161. DUA-WEPL-437
022. DUA-4L9D-PR5    057. DUA-D5PU-4O2    092. DUA-LA1J-SEW    127. DUA-QTQ0-RMJ    162. DUA-WZY0-3MJ
023. DUA-578K-5QX    058. DUA-D7ST-NZR    093. DUA-LG12-ZO3    128. DUA-QULD-ZO8    163. DUA-XDZN-I5I
024. DUA-58FX-ZAP    059. DUA-DC94-L6M    094. DUA-LKDW-PIT    129. DUA-R0R9-FTT    164. DUA-XE2X-W1E
025. DUA-595N-EWJ    060. DUA-DPOE-8GD    095. DUA-LO44-C89    130. DUA-R9IP-A9A    165. DUA-XH7J-B6X
026. DUA-5DG2-MHJ    061. DUA-DS9H-THR    096. DUA-LOXY-Q41    131. DUA-REKC-XIP    166. DUA-XYTJ-M6R
027. DUA-5GDU-GU4    062. DUA-DW7K-F3R    097. DUA-LWOW-T1Y    132. DUA-RM5K-KIQ    167. DUA-YC38-04D
028. DUA-5HX2-OTO    063. DUA-DWE8-MUM    098. DUA-LZMS-6FO    133. DUA-RO7R-578    168. DUA-ZDSQ-45B
029. DUA-5ME0-1UZ    064. DUA-EZS1-2WZ    099. DUA-MAA6-QIO    134. DUA-RYIN-TAC    169. DUA-ZL1Z-CAF
030. DUA-5MEO-FFQ    065. DUA-F1WZ-QN2    100. DUA-MDDY-PIW    135. DUA-S1HE-BM9    170. DUA-ZPZW-3QS
031. DUA-5T39-ON3    066. DUA-FS8I-EZT    101. DUA-MGP7-MA5    136. DUA-S8VM-GCH
032. DUA-6AAL-KAW    067. DUA-FUG1-XRG    102. DUA-MJ45-2XO    137. DUA-SS9O-3N5
033. DUA-6FQ8-0ZR    068. DUA-G7WJ-FGS    103. DUA-MLD2-2UM    138. DUA-SZY0-37F
034. DUA-6IXL-JID    069. DUA-GFYE-A04    104. DUA-MNVM-LHW    139. DUA-T8H5-240
035. DUA-6SCP-2AR    070. DUA-GHVM-R78    105. DUA-MTVV-V38    140. DUA-TH5G-4OB
```

</details>

---

## 🔍 DIAGNÓSTICO DE PROBLEMAS

### Problema: "Este código não existe"

**Causa:** Tabela `invite_codes` vazia  
**Solução:** Executar `insert-170-codes.sql`

### Problema: "Este código já foi utilizado"

**Causa:** Código marcado como `active = false`  
**Solução:** Usar outro código da lista

### Problema: RLS não permite leitura

**Causa:** Row Level Security bloqueando consultas  
**Solução:** Já está no script SQL (policies criadas automaticamente)

---

## 📁 ARQUIVOS DO SISTEMA

```
insert-170-codes.sql    → Script SQL principal (EXECUTAR ESTE!)
verify-codes.mjs        → Verificação automática (Node.js)
test-codes.sh           → Teste bash simples
CODIGO_ACESSO_GUIDE.md  → Este guia
```

---

## 🚀 FLUXO DE FUNCIONAMENTO

```
1. Usuário acessa /acesso
   ↓
2. Digite código (ex: DUA-03BN-9QT)
   ↓
3. Sistema consulta: SELECT * FROM invite_codes WHERE code = 'DUA-03BN-9QT'
   ↓
4. Verifica:
   ✓ Código existe?
   ✓ active = true?
   ✓ used_by = null?
   ↓
5. Se tudo OK:
   → "Código válido ✅"
   → Permite registo
   ↓
6. Após registo:
   → UPDATE invite_codes SET active = false, used_by = user_id
   → Código marcado como usado
```

---

## 🎯 CHECKLIST FINAL

Antes de usar os códigos em produção:

- [ ] Executei `insert-170-codes.sql` no Supabase
- [ ] Verifiquei que retornou 170 códigos
- [ ] Testei 1 código na página /acesso
- [ ] Código foi validado com sucesso
- [ ] Consegui criar conta com o código
- [ ] Código foi marcado como usado após registo

---

## 💡 COMANDOS ÚTEIS (Supabase SQL Editor)

```sql
-- Ver todos os códigos
SELECT * FROM invite_codes ORDER BY code;

-- Ver apenas códigos ativos
SELECT * FROM invite_codes WHERE active = true;

-- Contar códigos por status
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE active = true) as ativos,
  COUNT(*) FILTER (WHERE active = false) as usados
FROM invite_codes;

-- Ver quem usou qual código
SELECT 
  ic.code,
  ic.used_at,
  u.name,
  u.email
FROM invite_codes ic
LEFT JOIN users u ON ic.used_by = u.id
WHERE ic.active = false;

-- Resetar um código específico (tornar ativo novamente)
UPDATE invite_codes 
SET active = true, used_by = null, used_at = null 
WHERE code = 'DUA-03BN-9QT';

-- Resetar TODOS os códigos (CUIDADO!)
UPDATE invite_codes 
SET active = true, used_by = null, used_at = null;
```

---

## 📞 SUPORTE

Se após executar o script SQL os códigos ainda não funcionarem:

1. Verifique as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. Verifique RLS no Supabase:
   - Table Editor > invite_codes > RLS deve estar ON
   - Policies devem permitir SELECT para anon

3. Verifique logs do Supabase:
   - Dashboard > Logs > API
   - Procure erros relacionados a `invite_codes`

---

**Criado em:** 08/11/2025  
**Última atualização:** 08/11/2025  
**Versão:** 1.0  
**Status:** ✅ Funcional
