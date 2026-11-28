# Fotos padrão das espécies

Uma foto por espécie do catálogo, com o nome igual ao id da espécie
(`cat-betta.jpg`, `cat-ocellaris.jpg`...). Elas aparecem quando o organismo não tem foto própria.

## Baixar as fotos de banco de imagens

```bash
npm run species-photos
```

Busca no Wikimedia Commons uma foto por espécie, só com licença livre (CC0, domínio público,
CC BY ou CC BY-SA), baixa em 900 px de largura e grava autor, licença e link em
`src/features/species/data/speciesPhotoCredits.json`. Esses créditos aparecem no app em
Perfil > Créditos das imagens, como a licença exige.

O script **não sobrescreve** fotos que já existem. Para buscar de novo uma espécie,
apague o arquivo dela, ou rode `npm run species-photos -- --force cat-betta`.

Confira as fotos baixadas: a busca é automática e pode trazer uma imagem ruim
(foto de museu, desenho, peixe fora d'água). Apague a ruim e rode de novo para pegar a próxima
opção, ou troque por uma foto sua.

## Trocar por uma foto sua

1. Salve a sua foto aqui com o mesmo nome (ex.: `cat-betta.jpg`), substituindo a anterior.
   Prefira paisagem, por volta de 1200 × 900 px.
2. Rode `npm run species-photos -- --index`. Ele atualiza o índice e marca a foto como sua
   nos créditos (no lugar do autor do Wikimedia).
