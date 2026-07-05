import * as React from "react";

export const Card = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}
      {...props}
    />
  );
};

export const CardHeader = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`p-4 border-b ${className}`} {...props} />
  );
};

export const CardContent = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`p-4 ${className}`} {...props} />
  );
};

export const CardTitle = ({ className = "", ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h2 className={`text-lg font-semibold ${className}`} {...props} />
  );
};