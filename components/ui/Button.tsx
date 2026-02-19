type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ children, className, ...props }: ButtonProps) {
  return (
    <button className={className ? `btn ${className}` : 'btn'} {...props}>
      {children}
    </button>
  );
}
