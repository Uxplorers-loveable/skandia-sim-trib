import React from 'react';

interface ProgressStepsProps {
  currentStep: number;
  steps: string[];
}

const ProgressSteps: React.FC<ProgressStepsProps> = ({ currentStep, steps }) => {
  return (
    <div className="flex items-center justify-center gap-0 w-full max-w-md mx-auto py-s3">
      {steps.map((label, index) => {
        const stepNum = index + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;
        const isPending = stepNum > currentStep;

        return (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-heading font-bold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-primary text-primary-foreground'
                    : isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-background border-2 border-border text-muted-foreground'
                }`}
              >
                {isCompleted ? (
                  <i className="fa-solid fa-check text-xs" />
                ) : (
                  stepNum
                )}
              </div>
              <span
                className={`text-xs font-body font-medium whitespace-nowrap ${
                  isActive ? 'text-foreground font-bold' : 'text-muted-foreground'
                }`}
              >
                {label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mt-[-20px] rounded-full transition-colors ${
                  isCompleted ? 'bg-primary' : 'bg-border'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default ProgressSteps;
