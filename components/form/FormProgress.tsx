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
          <h2 className="text-3xl font-extrabold text-stone-800">
            {steps[currentStep - 1]?.label || 'Complete'}
          </h2>
          <p className="text-stone-500 text-sm font-medium mt-1">
            Step {currentStep} of {totalSteps}
          </p>
        </div>
        <span className="text-orange-500 font-black bg-orange-100 px-3 py-1 rounded-lg">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden p-0.5">
        <div
          className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full shadow-sm transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between mt-4">
        {steps.map((step) => (
          <div
            key={step.number}
            className={cn(
              'flex items-center gap-2 text-sm font-medium transition-colors',
              step.number === currentStep
                ? 'text-orange-500'
                : step.number < currentStep
                ? 'text-stone-600'
                : 'text-stone-400'
            )}
          >
            <div
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                step.number === currentStep
                  ? 'bg-orange-500 text-white'
                  : step.number < currentStep
                  ? 'bg-stone-600 text-white'
                  : 'bg-stone-200 text-stone-500'
              )}
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
