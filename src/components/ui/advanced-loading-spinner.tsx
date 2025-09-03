
import React from "react";
import { motion } from "framer-motion";
import { Calculator, TrendingUp, Zap } from "lucide-react";

interface AdvancedLoadingSpinnerProps {
  variant?: "default" | "calculator" | "dashboard" | "minimal";
  size?: "sm" | "md" | "lg";
  message?: string;
}

const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

const pulseVariants = {
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const floatVariants = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const AdvancedLoadingSpinner: React.FC<AdvancedLoadingSpinnerProps> = ({
  variant = "default",
  size = "md",
  message
}) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  const containerSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  if (variant === "minimal") {
    return (
      <motion.div
        variants={spinnerVariants}
        animate="animate"
        className={`${sizeClasses[size]} border-2 border-brand-200 border-t-brand-600 rounded-full`}
      />
    );
  }

  if (variant === "calculator") {
    return (
      <div className={`flex flex-col items-center gap-4 ${containerSizeClasses[size]}`}>
        <motion.div
          variants={floatVariants}
          animate="animate"
          className="relative"
        >
          <motion.div
            variants={pulseVariants}
            animate="animate"
            className="absolute inset-0 bg-brand-100 rounded-full blur-xl opacity-60"
          />
          <div className="relative bg-gradient-to-r from-brand-500 to-brand-600 p-4 rounded-full shadow-lg">
            <Calculator className="h-8 w-8 text-white" />
          </div>
        </motion.div>
        {message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-600 font-medium text-center"
          >
            {message}
          </motion.p>
        )}
        <div className="flex gap-1">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
              className="w-2 h-2 bg-brand-500 rounded-full"
            />
          ))}
        </div>
      </div>
    );
  }

  if (variant === "dashboard") {
    return (
      <div className={`flex flex-col items-center gap-4 ${containerSizeClasses[size]}`}>
        <div className="relative">
          <motion.div
            variants={spinnerVariants}
            animate="animate"
            className="w-16 h-16 border-4 border-brand-100 border-t-brand-500 rounded-full"
          />
          <motion.div
            variants={pulseVariants}
            animate="animate"
            className="absolute inset-2 bg-gradient-to-r from-brand-50 to-blue-50 rounded-full flex items-center justify-center"
          >
            <TrendingUp className="h-6 w-6 text-brand-600" />
          </motion.div>
        </div>
        {message && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gray-600 font-medium text-center max-w-xs"
          >
            {message}
          </motion.p>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-3 ${containerSizeClasses[size]}`}>
      <div className="relative">
        <motion.div
          variants={spinnerVariants}
          animate="animate"
          className={`${sizeClasses[size]} border-2 border-brand-200 border-t-brand-600 rounded-full`}
        />
        <motion.div
          variants={pulseVariants}
          animate="animate"
          className="absolute inset-0 rounded-full bg-brand-100 opacity-20"
        />
      </div>
      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-600 text-sm font-medium"
        >
          {message}
        </motion.p>
      )}
    </div>
  );
};

export default AdvancedLoadingSpinner;
