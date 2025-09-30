"use client";

import React from 'react';
import {
  Ship,
  Package,
  Truck,
  Building,
  CheckCircle,
  LucideIcon,
} from "lucide-react";

interface StatusConfig {
  icon: LucideIcon;
  color: string;
  step: number;
}

const statusConfig: Record<string, StatusConfig> = {
  "pending": {
    icon: Package,
    color: "bg-gray-100 text-gray-800 border-gray-300",
    step: 1
  },
  "in_transit": {
    icon: Truck,
    color: "bg-blue-100 text-blue-800 border-blue-300",
    step: 2
  },
  "customs": {
    icon: Building,
    color: "bg-orange-100 text-orange-800 border-orange-300",
    step: 3
  },
  "delivered": {
    icon: CheckCircle,
    color: "bg-green-100 text-green-800 border-green-300",
    step: 4
  }
};

interface ShipmentStepperProps {
  currentStatus: string;
}

export default function ShipmentStepper({ currentStatus }: ShipmentStepperProps) {
  const steps = ["pending", "in_transit", "customs", "delivered"];
  const stepLabels = ["Pending", "In Transit", "Customs", "Delivered"];
  const currentStep = statusConfig[currentStatus]?.step || 1;

  return (
    <div className="flex items-center space-x-2 overflow-x-auto py-2">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        const config = statusConfig[step];
        const Icon = config.icon;

        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center text-center">
              <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                isCompleted ? 'bg-green-500 border-green-500' :
                isActive ? 'bg-white border-blue-500 scale-110 shadow-lg' :
                'bg-gray-100 border-gray-300'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="w-6 h-6 text-white" />
                ) : (
                  <Icon className={`w-6 h-6 transition-colors ${
                    isActive ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                )}
              </div>
              <div className={`mt-2 text-xs font-medium w-20 ${
                isActive ? 'text-blue-600' : 
                isCompleted ? 'text-green-600' : 'text-gray-500'
              }`}>
                {stepLabels[index]}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-2 transition-colors duration-300 ${
                isCompleted ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
