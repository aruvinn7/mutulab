import RevealSteps from '../ui/RevealSteps';
import Formula from '../ui/Formula';
import type { ExampleStep } from '../../content/modules/types';
import './example-reveal.css';

interface Props {
  id: string;
  steps: ExampleStep[];
}

/** Membungkus RevealSteps dengan perender rumus, agar Board Reveal bekerja di Mode Mengajar. */
export default function ExampleReveal({ id, steps }: Props) {
  const revealSteps = steps.map((step) => ({
    title: step.title,
    content: (
      <div className="ex-step-body">
        {step.formula && (
          <div className="ex-formula">
            <Formula tex={step.formula} display />
          </div>
        )}
        {step.substitution && (
          <p className="ex-substitution">
            <span className="ex-tag">Substitusi</span>
            <Formula tex={step.substitution} />
          </p>
        )}
        {step.result && (
          <p className="ex-result">
            <span className="ex-tag">Hasil</span>
            <span>{step.result}</span>
          </p>
        )}
        {step.detail && <p className="ex-detail">{step.detail}</p>}
      </div>
    ),
  }));

  return <RevealSteps id={id} steps={revealSteps} />;
}
