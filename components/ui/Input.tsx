type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return <input className={className ? `input ${className}` : 'input'} {...props} />;
}
