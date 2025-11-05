-- 6. Funções e triggers automáticos
CREATE OR REPLACE FUNCTION process_token_purchase()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando uma compra é completada, adicionar tokens ao usuário
  IF NEW.payment_status = 'completed' AND OLD.payment_status != 'completed' THEN
    UPDATE users 
    SET 
      total_tokens = total_tokens + NEW.tokens_amount,
      updated_at = NOW()
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para processar compras
DROP TRIGGER IF EXISTS process_token_purchase_trigger ON user_purchases;
CREATE TRIGGER process_token_purchase_trigger
  AFTER UPDATE ON user_purchases
  FOR EACH ROW
  EXECUTE FUNCTION process_token_purchase();

-- Função para registrar uso de tokens
CREATE OR REPLACE FUNCTION record_token_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar contadores no perfil do usuário
  UPDATE users 
  SET 
    tokens_used = tokens_used + NEW.tokens_used,
    total_generated_content = total_generated_content + 1,
    updated_at = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para uso de tokens
DROP TRIGGER IF EXISTS record_token_usage_trigger ON token_usage_log;
CREATE TRIGGER record_token_usage_trigger
  AFTER INSERT ON token_usage_log
  FOR EACH ROW
  EXECUTE FUNCTION record_token_usage();