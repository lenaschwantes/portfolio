# portfolio

Portfolio pessoal de Helena Gonçalves Schwantes (Data Engineer / LLM Integration), publicado em https://helena.schwantes.com.br.

## Stack

- HTML, CSS e JavaScript puros, sem framework e sem build
- Mascote animado em [Rive](https://rive.app) (`assets/robocat.riv`), carregado via `@rive-app/canvas` pelo CDN
- Animações de scroll com [GSAP](https://gsap.com) (ScrollTrigger, SplitText) e smooth scroll com [Lenis](https://lenis.darkroom.engineering), via CDN
- GitHub Pages

## Rodar local

O `.riv` é carregado via `fetch`, então precisa de um servidor (abrir o arquivo direto não funciona):

```bash
python -m http.server 8000
```

Depois abra http://localhost:8000.
