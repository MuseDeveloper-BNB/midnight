type ErrorMessageProps = {
  message: string;
};

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <p className="msg-error" role="alert">
      {message}
    </p>
  );
}
