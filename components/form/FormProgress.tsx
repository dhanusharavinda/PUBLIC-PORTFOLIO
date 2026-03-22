'use client';

import { cn } from '@/lib/utils';

interface FormProgressProps {
  currentStep: number;
  totalSteps?: number;
}

const steps = [
  { number: 1, label: 'Personal Info' },
  { number: 2, label: 'Skills' },
  { number: 3, label: 'Experience' },
  { number: 4, label: 'Projects' },
  { number: 5, label: 'Template' },
];

export function FormProgress({ currentStep, totalSteps = 5 }: FormProgressProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="mb-8">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2
            className="text-2xl font-extrabold m-zine-heading"
            style={{ color: 'var(--m-text-heading)', fontFamily: 'var(--m-font-heading)' }}
          >
            {steps[currentStep - 1]?.label || 'Complete'}
          </h2>
          <p className="text-sm font-medium mt-1" style={{ color: 'var(--m-text-secondary)' }}>
            Step {currentStep} of {totalSteps}
          </p>
        </div>
        <span
          className="font-black px-3 py-1 text-sm"
          style={{
            backgroundColor: 'var(--m-accent-light)',
            color: 'var(--m-accent)',
            borderRadius: 'var(--m-radius)',
          }}
        >
          {Math.round(progress)}%
        </span>
      </div>
      <div
        className="h-2.5 w-full overflow-hidden p-0.5"
        style={{
          backgroundColor: 'var(--m-bg-secondary)',
          borderRadius: 'var(--m-radius)',
        }}
      >
        <div
          className="h-full shadow-sm transition-all duration-500"
          style={{
            width: `${progress}%`,
            background: 'var(--m-gradient)',
            borderRadius: 'var(--m-radius)',
          }}
        />
      </div>
      <div className="flex justify-between mt-4">
        {steps.map((step) => (
          <div
            key={step.number}
            className="flex items-center gap-2 text-sm font-medium transition-colors"
            style={{
              color: step.number === currentStep
                ? 'var(--m-accent)'
                : step.number < currentStep
                ? 'var(--m-text)'
                : 'var(--m-text-muted)',
            }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
              style={{
                backgroundColor: step.number === currentStep
                  ? 'var(--m-accent)'
                  : step.number < currentStep
                  ? 'var(--m-text-secondary)'
                  : 'var(--m-bg-secondary)',
                color: step.number <= currentStep
                  ? 'var(--m-bg)'
                  : 'var(--m-text-muted)',
              }}
            >
              {step.number < currentStep ? '✓' : step.number}
            </div>
            <span className="hidden sm:inline">{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
