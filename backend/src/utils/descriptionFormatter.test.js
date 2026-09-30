import { describe, it, expect } from 'vitest';
import {
  formatDescription,
  extractShortDescription,
  htmlToText,
  isFlatDescription
} from './descriptionFormatter.js';

const html = (raw) => formatDescription(raw).html;
const text = (raw) => formatDescription(raw).text;

describe('formatDescription — texto con saltos de línea (scraper corregido)', () => {
  it('un párrafo por línea y título en negrita', () => {
    expect(html('Piso reformado en Igualada\nSe vende piso en el centro.\nMuy luminoso y exterior.'))
      .toBe('<p><strong>Piso reformado en Igualada</strong></p>'
        + '<p>Se vende piso en el centro.</p><p>Muy luminoso y exterior.</p>');
  });

  it('agrupa líneas cortas en una lista tras su introducción', () => {
    expect(html('Piso en venta.\n¿Qué encontrarás?\n3 habitaciones\n2 baños\nTerraza\nContacta con nosotros para visitarlo cuanto antes, te sorprenderá.'))
      .toBe('<p>Piso en venta.</p><p><strong>¿Qué encontrarás?</strong></p>'
        + '<ul><li>3 habitaciones</li><li>2 baños</li><li>Terraza</li></ul>'
        + '<p>Contacta con nosotros para visitarlo cuanto antes, te sorprenderá.</p>');
  });

  it('respeta viñetas explícitas y subtítulos en mayúsculas', () => {
    expect(html('Casa en venta.\nEXTRAS\n- Piscina\n• Garaje'))
      .toBe('<p>Casa en venta.</p><p><strong>EXTRAS</strong></p><ul><li>Piscina</li><li>Garaje</li></ul>');
  });

  it('las líneas que empiezan por emoji no llevan viñeta extra', () => {
    expect(html('Casa en venta.\n🏡 3 habitaciones\n🛁 2 baños\n🌳 Jardín'))
      .toBe('<p>Casa en venta.</p><p>🏡 3 habitaciones</p><p>🛁 2 baños</p><p>🌳 Jardín</p>');
  });

  it('parte los párrafos muy largos por frases completas', () => {
    const frase = 'Esta vivienda tiene una distribución excelente y mucha luz natural durante todo el día.';
    const bloques = html(Array(8).fill(frase).join(' ')).match(/<p>/g);
    expect(bloques.length).toBeGreaterThan(1);
  });

  it('no inventa saltos en un texto que ya los trae', () => {
    expect(text('Suite con WiFi.\nPlanta 3ºA, 90m2.')).toBe('Suite con WiFi.\nPlanta 3ºA, 90m2.');
  });
});

describe('formatDescription — texto pegado (scraper antiguo)', () => {
  it('separa frases y líneas pegadas', () => {
    expect(text('¡DÚPLEX EN CAPELLADES!¿Buscas una vivienda amplia? Esta es la tuya.En venta dúplex de 150 m².'))
      .toBe('¡DÚPLEX EN CAPELLADES!\n¿Buscas una vivienda amplia? Esta es la tuya.\nEn venta dúplex de 150 m².');
  });

  it('separa elementos de lista pegados', () => {
    expect(text('¿Qué encontrarás?150 m² de vivienda3 habitaciones2 baños con instalación para 3Terraza privadaBalcón3ª planta con ascensorEdificio de 2008Para entrar a vivirESPACIO PARA DISFRUTARUno de los atractivos.'))
      .toBe('¿Qué encontrarás?\n150 m² de vivienda\n3 habitaciones\n2 baños con instalación para 3\n'
        + 'Terraza privada\nBalcón\n3ª planta con ascensor\nEdificio de 2008\nPara entrar a vivir\n'
        + 'ESPACIO PARA DISFRUTAR\nUno de los atractivos.');
  });

  it('no parte números, unidades, abreviaturas ni siglas', () => {
    const t = 'Precio 10.000 € a las 10:30 en la Avda.Barcelona, piso 3ºA de 90m2 y 10cm2, con WiFi y DNIs de S.A. todo bien';
    expect(text(t)).toBe(t);
  });

  it('coloca los marcadores de negrita en la línea que les corresponde', () => {
    expect(text('Piso en venta.**La vivienda dispone de: **3 habitaciones.Lavadero.**2 plazas de parking**.Terraza.'))
      .toBe('Piso en venta.\n**La vivienda dispone de: **\n3 habitaciones.\nLavadero.\n**2 plazas de parking**.\nTerraza.');
  });

  it('quita el botón «Leer comentario completo» y los puntos sobrantes', () => {
    expect(text('Casa en venta en Òdena , muy luminosa.¡Te encantará! .Leer comentario completo'))
      .toBe('Casa en venta en Òdena, muy luminosa.\n¡Te encantará!');
  });

  it('convierte los separadores en saltos de sección', () => {
    expect(html('Piso amplio en Capellades.________La viviendaEste piso destaca por su amplitud, su luz natural y una distribución muy funcional.'))
      .toBe('<p>Piso amplio en Capellades.</p><p><strong>La vivienda</strong></p>'
        + '<p>Este piso destaca por su amplitud, su luz natural y una distribución muy funcional.</p>');
  });
});

describe('formatDescription — seguridad y bordes', () => {
  it('escapa el HTML del texto de origen', () => {
    expect(html('Piso <script>alert(1)</script> & "jardín".'))
      .toBe('<p>Piso &lt;script&gt;alert(1)&lt;/script&gt; &amp; &quot;jardín&quot;.</p>');
  });

  it('convierte el Markdown ligero en negritas y cursivas', () => {
    expect(html('Terraza de **45 m²** y *vistas*.')).toBe('<p>Terraza de <strong>45 m²</strong> y <em>vistas</em>.</p>');
  });

  it('devuelve vacío para null, undefined o solo espacios', () => {
    expect(formatDescription(null)).toEqual({ text: '', html: '' });
    expect(formatDescription(undefined)).toEqual({ text: '', html: '' });
    expect(formatDescription('   \n  ')).toEqual({ text: '', html: '' });
  });
});

describe('extractShortDescription', () => {
  it('usa la primera frase de la primera línea', () => {
    expect(extractShortDescription('¡Fantástico piso en Vilanova! Si buscas una vivienda cómoda...\nOtra línea'))
      .toBe('¡Fantástico piso en Vilanova!');
  });

  it('une un título muy breve con la línea siguiente', () => {
    expect(extractShortDescription('Chalet en Mediona\n5 hab · 2 baños · 127 m²\nUn lugar para vivir'))
      .toBe('Chalet en Mediona. 5 hab · 2 baños · 127 m²');
  });

  it('no supera nunca la longitud máxima y quita el Markdown', () => {
    const corta = extractShortDescription(`**${'palabra '.repeat(80)}**`);
    expect(corta.length).toBeLessThanOrEqual(300);
    expect(corta).not.toContain('*');
    expect(corta.endsWith('...')).toBe(true);
  });
});

describe('htmlToText / isFlatDescription', () => {
  it('recupera el texto con negritas y párrafos', () => {
    expect(htmlToText('<p>Uno &amp; <strong>dos</strong></p><p>tres</p>')).toBe('Uno & **dos**\ntres\n');
  });

  it('solo considera plana una descripción de un único bloque', () => {
    expect(isFlatDescription('<p>Todo pegado en un párrafo</p>')).toBe(true);
    expect(isFlatDescription('Texto sin etiquetas')).toBe(true);
    expect(isFlatDescription('<p>Uno</p><p>Dos</p>')).toBe(false);
    expect(isFlatDescription('<p>Intro</p><ul><li>Uno</li></ul>')).toBe(false);
    expect(isFlatDescription('')).toBe(false);
    expect(isFlatDescription(null)).toBe(false);
  });
});
