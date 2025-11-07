import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { item_id } = await request.json()

    if (!item_id) {
      return NextResponse.json(
        { sucesso: false, erro: 'Item ID é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar autenticação
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { sucesso: false, erro: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Extrair user_id do token
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      return NextResponse.json(
        { sucesso: false, erro: 'Token inválido' },
        { status: 401 }
      )
    }

    // Processar compra via função do Supabase
    const { data, error } = await supabase
      .rpc('processar_compra_mercado', {
        p_item_id: item_id,
        p_comprador_id: user.id
      })

    if (error) {
      console.error('Erro ao processar compra:', error)
      return NextResponse.json(
        { sucesso: false, erro: error.message },
        { status: 500 }
      )
    }

    if (!data.sucesso) {
      return NextResponse.json(
        { sucesso: false, erro: data.erro },
        { status: 400 }
      )
    }

    return NextResponse.json({
      sucesso: true,
      compra_id: data.compra_id,
      download_url: data.download_url,
      preco_pago: data.preco_pago
    })

  } catch (error: any) {
    console.error('Erro no endpoint de compra:', error)
    return NextResponse.json(
      { sucesso: false, erro: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
