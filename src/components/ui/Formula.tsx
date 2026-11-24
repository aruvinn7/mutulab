import katex from 'katex';

interface Props {
  tex: string;
  display?: boolean;
  class?: string;
}

export default function Formula({ tex, display = false, class: className = '' }: Props) {
  let html = '';
  try {
    html = katex.renderToString(tex, {
      displayMode: display,
      throwOnError: false,
      output: 'html',
      strict: 'ignore',
      trust: false,
    });
  } catch {
    html = `<code>${tex}</code>`;
  }
  return <span className={`formula ${display ? 'formula-block' : ''} ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
