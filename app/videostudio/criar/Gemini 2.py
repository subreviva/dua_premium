Gemini 2.5 Flash Image 5 creditos 

Gemini 2.5 Flash Image

from google import genai
from google.genai import types
from PIL import Image

client = genai.Client()

prompt = (
    "Create a picture of a nano banana dish in a fancy restaurant with a Gemini theme"
)

response = client.models.generate_content(
    model="gemini-2.5-flash-image",
    contents=[prompt],
)

for part in response.parts:
    if part.text is not None:
        print(part.text)
    elif part.inline_data is not None:
        image = part.as_image()
        image.save("generated_image.png")

Você pode configurar as modalidades de resposta e a proporção da saída do modelo no campo config das chamadas generate_content.

Tipos de saída
Por padrão, o modelo retorna respostas de texto e imagem (ou seja, response_modalities=['Text', 'Image']). É possível configurar a resposta para retornar apenas imagens sem texto usando response_modalities=['Image'].

response = client.models.generate_content(
    model="gemini-2.5-flash-image",
    contents=[prompt],
    config=types.GenerateContentConfig(
        response_modalities=['Image']
    )
)

Proporções
Por padrão, o modelo corresponde o tamanho da imagem de saída ao da imagem de entrada ou gera quadrados 1:1. É possível controlar a proporção da imagem de saída usando o campo aspect_ratio em image_config na solicitação de resposta, mostrada aqui:


Edição de imagens (texto e imagem para imagem)

from google import genai
from google.genai import types
from PIL import Image

client = genai.Client()

prompt = (
    "Create a picture of my cat eating a nano-banana in a "
    "fancy restaurant under the Gemini constellation",
)

image = Image.open("/path/to/cat_image.png")

response = client.models.generate_content(
    model="gemini-2.5-flash-image",
    contents=[prompt, image],
)

for part in response.parts:
    if part.text is not None:
        print(part.text)
    elif part.inline_data is not None:
        image = part.as_image()
        image.save("generated_image.png")




Outros modos de geração de imagens
O Gemini oferece suporte a outros modos de interação com imagens com base na estrutura e no contexto do comando, incluindo:
Texto para imagens e texto (intercalado): gera imagens com texto relacionado.
Exemplo de comando: "Gere uma receita ilustrada de paella".
Imagens e texto para imagens e texto (intercalados): usa imagens e texto de entrada para criar novas imagens e texto relacionados.
Exemplo de comando: (com uma imagem de um quarto mobiliado) "Quais outras cores de sofás ficariam boas no meu espaço? Você pode atualizar a imagem?"
Edição de imagens com várias interações (chat): continue gerando e editando imagens em uma conversa.
Exemplos de comandos: [faça upload de uma imagem de um carro azul]. , "Transforme este carro em um conversível", "Agora mude a cor para amarelo."




1. Cenas fotorrealistas
Para imagens realistas, use termos de fotografia. Mencione ângulos de câmera, tipos de lente, iluminação e detalhes para guiar o modelo a um resultado fotorrealista.

A photorealistic [shot type] of [subject], [action or expression], set in
[environment]. The scene is illuminated by [lighting description], creating
a [mood] atmosphere. Captured with a [camera/lens details], emphasizing
[key textures and details]. The image should be in a [aspect ratio] format.



2. Ilustrações e adesivos estilizados
Para criar adesivos, ícones ou recursos, seja explícito sobre o estilo e peça um plano de fundo transparente.

A [style] sticker of a [subject], featuring [key characteristics] and a
[color palette]. The design should have [line style] and [shading style].
The background must be transparent.



3. Texto preciso em imagens
O Gemini é excelente em renderização de texto. Seja claro sobre o texto, o estilo da fonte (de forma descritiva) e o design geral.

Create a [image type] for [brand/concept] with the text "[text to render]"
in a [font style]. The design should be [style description], with a
[color scheme].


4. Simulações de produtos e fotografia comercial
Perfeito para criar fotos de produtos limpas e profissionais para e-commerce, publicidade ou branding.

A high-resolution, studio-lit product photograph of a [product description]
on a [background surface/description]. The lighting is a [lighting setup,
e.g., three-point softbox setup] to [lighting purpose]. The camera angle is
a [angle type] to showcase [specific feature]. Ultra-realistic, with sharp
focus on [key detail]. [Aspect ratio].


5. Design minimalista e com espaço negativo
Excelente para criar planos de fundo para sites, apresentações ou materiais de marketing em que o texto será sobreposto.

A minimalist composition featuring a single [subject] positioned in the
[bottom-right/top-left/etc.] of the frame. The background is a vast, empty
[color] canvas, creating significant negative space. Soft, subtle lighting.
[Aspect ratio].


6. Arte sequencial (painel de quadrinhos / storyboard)
Cria painéis para contar histórias visuais com base na consistência dos personagens e na descrição das cenas.

A single comic book panel in a [art style] style. In the foreground,
[character description and action]. In the background, [setting details].
The panel has a [dialogue/caption box] with the text "[Text]". The lighting
creates a [mood] mood. [Aspect ratio].


Comandos para editar imagens
Estes exemplos mostram como fornecer imagens junto com seus comandos de texto para edição, composição e transferência de estilo.
1. Adicionar e remover elementos
Forneça uma imagem e descreva a mudança. O modelo vai corresponder ao estilo, à iluminação e à perspectiva da imagem original.

Using the provided image of [subject], please [add/remove/modify] [element]
to/from the scene. Ensure the change is [description of how the change should
integrate].


2. Retoque (mascaramento semântico)
Defina uma "máscara" por conversa para editar uma parte específica de uma imagem sem alterar o restante.

Using the provided image, change only the [specific element] to [new
element/description]. Keep everything else in the image exactly the same,
preserving the original style, lighting, and composition.


3. Transferência de estilo
Forneça uma imagem e peça para o modelo recriar o conteúdo dela em um estilo artístico diferente.

Transform the provided photograph of [subject] into the artistic style of [artist/art style]. Preserve the original composition but render it with [description of stylistic elements].


4. Composição avançada: combinar várias imagens
Forneça várias imagens como contexto para criar uma cena nova e composta. Isso é perfeito para simulações de produtos ou colagens criativas.

Create a new image by combining the elements from the provided images. Take
the [element from image 1] and place it with/on the [element from image 2].
The final image should be a [description of the final scene].


5. Preservação de detalhes de alta fidelidade
Para garantir que detalhes importantes (como um rosto ou um logotipo) sejam preservados durante uma edição, descreva-os com muitos detalhes junto com sua solicitação de edição.

Using the provided images, place [element from image 2] onto [element from
image 1]. Ensure that the features of [element from image 1] remain
completely unchanged. The added element should [description of how the
element should integrate].

response = client.models.generate_content(
    model="gemini-2.5-flash-image",
    contents=[prompt],
    config=types.GenerateContentConfig(
        image_config=types.ImageConfig(
            aspect_ratio="16:9",
        )
    )
)