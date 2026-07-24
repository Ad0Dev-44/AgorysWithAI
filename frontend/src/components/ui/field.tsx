/* eslint-disable jsx-a11y/label-has-associated-control */

import * as React from "react";

export const Field = ({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={`space-y-1 ${className}`} {...props} />;
};

export const FieldGroup = ({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={`space-y-2 ${className}`} {...props} />;
};

export const FieldLabel = ({
  className = "",
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) => {
  return (
    <label
      className={`text-sm font-medium ${className}`}
      {...props}
    />
  );
};

export const FieldError = ({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p
      className={`text-xs text-destructive ${className}`}
      {...props}
    />
  );
};