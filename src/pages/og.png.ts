import type { APIRoute } from 'astro';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

async function loadGoogleFont(family: string, weight: number) {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}`,
    {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    }
  ).then((r) => r.text());

  const urls = [...css.matchAll(/url\(([^)]+)\)/g)].map((m) => m[1]);
  return Promise.all(
    urls.map(async (url) => ({
      name: family,
      data: await fetch(url).then((r) => r.arrayBuffer()),
      weight: weight as 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900,
      style: 'normal' as const,
    }))
  );
}

export const GET: APIRoute = async () => {
  const fonts = await loadGoogleFont('Noto Serif JP', 700);

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '1200px',
          height: '630px',
          background: '#0d1829',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '"Noto Serif JP"',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                color: '#3b82f6',
                fontSize: '20px',
                letterSpacing: '0.22em',
                marginBottom: '40px',
              },
              children: 'App & System Studio',
            },
          },
          {
            type: 'div',
            props: {
              style: {
                color: '#e8f0fb',
                fontSize: '82px',
                fontWeight: 700,
                lineHeight: 1.25,
                letterSpacing: '-0.02em',
                textAlign: 'center',
              },
              children: '想いを、動くものに。',
            },
          },
          {
            type: 'div',
            props: {
              style: {
                width: '48px',
                height: '2px',
                background: '#3b82f6',
                marginTop: '48px',
                marginBottom: '32px',
              },
              children: '',
            },
          },
          {
            type: 'div',
            props: {
              style: {
                color: '#7090b5',
                fontSize: '22px',
                letterSpacing: '0.04em',
              },
              children: 'Flowfine Works',
            },
          },
        ],
      },
    },
    { width: 1200, height: 630, fonts }
  );

  const png = new Resvg(svg).render().asPng();

  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};
