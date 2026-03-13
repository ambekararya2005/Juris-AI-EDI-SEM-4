import React from 'react';
import { Check } from 'lucide-react';

interface StepperProps {
  steps: string[];
  currentStep: number; // 0-indexed
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center w-full mb-8">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        const isFuture = index > currentStep;

        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                  transition-all duration-300
                  ${isCompleted ? 'bg-navy text-white' : ''}
                  ${isActive ? 'bg-gold text-white ring-4 ring-gold/30' : ''}
                  ${isFuture ? 'bg-white border-2 border-border text-muted-text' : ''}`}
              >
                {isCompleted ? <Check size={18} /> : index + 1}
              </div>
              <span
                className={`mt-2 text-xs font-medium text-center max-w-[80px] leading-tight
                  ${isActive ? 'text-gold' : isCompleted ? 'text-navy' : 'text-muted-text'}`}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-5 transition-all duration-500
                ${index < currentStep ? 'bg-navy' : 'bg-border'}`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Stepper;
